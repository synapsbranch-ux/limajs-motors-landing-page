# 🗺️ FEUILLE DE ROUTE FINALE - LIMAJS MOTORS

Cette liste de tâches couvre les dernières étapes critiques pour le lancement de la plateforme.

## 🔴 1. Landing Page & Infrastructure
- [ ] **Vérification Fix 403** (CloudFront/S3)
  - [ ] S'assurer que le script OAI a bien propagé les changements.
  - [ ] Tester l'accès public : `https://app.limajsmotors.com`
- [ ] **Optimisation**
  - [ ] Vérifier le chargement des images.
  - [ ] Vérifier le formulaire de contact (Lambda connectée).

## 🟠 2. Backend & Base de Données
- [ ] **Mise à jour Schéma Utilisateurs**
  - [ ] Ajouter champ `passengerType` : `student`, `employee`, `parent`, `free`.
  - [ ] Ajouter champ `nfcCardHash` (pour lien direct carte-user).
- [ ] **Seeding de Données (Script Python)**
  - [ ] **Utilisateurs** : Créer 50+ users variés (étudiants, employés, etc.).
  - [ ] **Cartes NFC** : Générer 100 UIDs, les hasher, et les insérer dans `limajs-nfc-cards`.
  - [ ] **Lier NFC aux Users** : Assigner des cartes pré-activées à certains users.
- [ ] **Tests bout-en-bout (E2E)**
  - [ ] Tester flux complet : Inscription -> Achat Abo -> Scan NFC -> Validation.
  - [ ] Tester flux complet : Recharge Wallet -> Paiement -> Validation Admin.

## 🟡 3. Application Admin (React Vite)
- [ ] **Initialisation**
  - [ ] `npm create vite@latest`
  - [ ] Setup Tailwind + Shadcn/UI.
- [ ] **Fonctionnalités Prioritaires**
  - [ ] Dashboard (Vue globale).
  - [ ] Gestion Utilisateurs (Validation documents).
  - [ ] Gestion Flotte (Bus + Routes).
  - [ ] Validation Paiements (Preuves virement).

## 🟢 4. Application Chauffeur (React Native)
- [ ] **Initialisation**
  - [ ] `npx create-expo-app`
- [ ] **Fonctionnalités Prioritaires**
  - [ ] Login Chauffeur (Role check).
  - [ ] Sélection Trajet.
  - [ ] **GPS Tracking** (Background location).
  - [ ] **Scanner QR/NFC** (Validation billets).

## 🔵 5. Application Passager (React Native)
- [ ] **Initialisation**
  - [ ] `npx create-expo-app`
- [ ] **Fonctionnalités Prioritaires**
  - [ ] Inscription / Login.
  - [ ] Carte Temps Réel (Voir bus).
  - [ ] **Wallet** (Recharge + Solde).
  - [ ] Achat Abonnement -> QR Code.

---

## 📅 Ordre d'Exécution Recommandé

1.  **Backend Fixes** (DB Schema + Seeding) -> *Bloquant pour tout le reste*
2.  **Landing Page Fix** -> *Visibilité immédiate*
3.  **App Admin** -> *Nécessaire pour valider les comptes/paiements des apps mobiles*
4.  **App Chauffeur** -> *Nécessaire pour générer de la donnée GPS*
5.  **App Passager** -> *Produit final*
