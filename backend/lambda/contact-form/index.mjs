import { Resend } from 'resend';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient();
let resendClient = null;
let adminEmails = [];
let fromEmail = '';

// Helper to get configuration
async function loadConfiguration() {
    const secretName = process.env.SECRET_NAME;
    if (!secretName) {
        throw new Error("SECRET_NAME environment variable is not set.");
    }

    try {
        const response = await secretsClient.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT",
            })
        );

        if (response.SecretString) {
            const secrets = JSON.parse(response.SecretString);
            return secrets;
        }

        throw new Error("SecretString is empty.");
    } catch (error) {
        console.error("Error retrieving secret:", error);
        throw error;
    }
}

// Helper to format JSON response for API Gateway
const response = (statusCode, body) => ({
    statusCode,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
});

export const handler = async (event) => {
    console.log("Event Received:", JSON.stringify(event, null, 2));

    // Handle CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return response(200, {});
    }

    try {
        // Lazy Load Configuration
        if (!resendClient) {
            const config = await loadConfiguration();

            const apiKey = config.RESEND_API_KEY;
            if (!apiKey || apiKey === 'placeholder_key') {
                console.error("RESEND_API_KEY is not configured.");
                return response(500, { success: false, message: "Server misconfiguration." });
            }

            resendClient = new Resend(apiKey);

            const adminEmailsStr = config.ADMIN_EMAILS || 'limajsmotorssa@gmail.com,mainoffice@limajs.com';
            adminEmails = adminEmailsStr.split(',').map(e => e.trim());

            fromEmail = config.FROM_EMAIL || 'contact@limajs.com';
        }

        const { name, email, phone, message } = JSON.parse(event.body || '{}');

        // Basic Validation
        if (!name || !email || !message) {
            return response(400, { success: false, message: "Missing required fields: name, email, or message." });
        }

        // 1. Send Notification to Admin
        const adminEmailData = await resendClient.emails.send({
            from: fromEmail,
            to: adminEmails,
            subject: `Nouveau Message de ${name} (Site Web Limajs)`,
            html: `
        <h2>Nouveau contact via le site web</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">${message}</blockquote>
      `
        });

        if (adminEmailData.error) {
            console.error("Resend Admin Error:", adminEmailData.error);
            throw new Error("Failed to send admin notification.");
        }

        // 2. Send Auto-Reply to User
        const userEmailData = await resendClient.emails.send({
            from: fromEmail,
            to: email,
            subject: "Nous avons bien reçu votre message - Limajs Motors",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${name},</h2>
          <p>Merci d'avoir contacté <strong>Limajs Motors</strong> via notre site web.</p>
          <p>Nous avons bien reçu votre message et notre équipe vous répondra dans les plus brefs délais.</p>
          <br>
          <p>Cordialement,</p>
          <p><strong>L'équipe Limajs Motors</strong></p>
          <hr>
          <p style="font-size: 12px; color: #888;">Ceci est un message automatique, merci de ne pas y répondre directement.</p>
        </div>
      `
        });

        if (userEmailData.error) {
            console.log("Auto-reply warning:", userEmailData.error);
        }

        return response(200, { success: true, message: "Message envoyé avec succès!" });

    } catch (error) {
        console.error("Handler Error:", error);
        return response(500, { success: false, message: "Erreur interne du serveur." });
    }
};
