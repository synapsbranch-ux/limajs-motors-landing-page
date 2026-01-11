import boto3
import os
import json
from botocore.exceptions import ClientError, EndpointConnectionError

# Configuration
AWS_REGION = "us-east-1"
ENV_FILE_PATH = "../../.env"
ENV_EXAMPLE_PATH = "../../.env.example"

# Client S3
s3 = boto3.client('s3', region_name=AWS_REGION)
sts = boto3.client('sts', region_name=AWS_REGION)

def get_account_id():
    """Récupère l'ID du compte AWS pour créer un nom de bucket unique."""
    try:
        return sts.get_caller_identity()['Account']
    except Exception as e:
        print(f"❌ Erreur récupération Account ID: {e}")
        return "default"

def update_env_file(key, value):
    """Mise à jour des fichiers .env et .env.example."""
    # .env
    content = ""
    if os.path.exists(ENV_FILE_PATH):
        with open(ENV_FILE_PATH, "r") as f:
            content = f.read()

    if f"{key}=" in content:
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith(f"{key}="):
                new_lines.append(f"{key}={value}")
            else:
                new_lines.append(line)
        content = "\n".join(new_lines)
    else:
        content += f"\n{key}={value}"

    with open(ENV_FILE_PATH, "w") as f:
        f.write(content)
    
    # .env.example (append if not exists)
    if os.path.exists(ENV_EXAMPLE_PATH):
        with open(ENV_EXAMPLE_PATH, "r") as f:
            example_content = f.read()
        
        if f"{key}=" not in example_content:
            with open(ENV_EXAMPLE_PATH, "a") as f:
                f.write(f"\n{key}={value}")
    
    print(f"   📝 Config {key} mise à jour.")

def create_s3_bucket():
    """Crée le bucket S3 avec configuration de sécurité."""
    print("\n📦 Configuration S3 Storage...")
    
    account_id = get_account_id()
    bucket_name = f"limajs-storage-{account_id}"
    
    try:
        # 1. Vérifier si le bucket existe
        try:
            s3.head_bucket(Bucket=bucket_name)
            print(f"   ℹ️ Le bucket {bucket_name} existe déjà.")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Bucket n'existe pas, on le crée
                print(f"   📦 Création du bucket : {bucket_name}...")
                
                # Pour us-east-1, ne pas spécifier LocationConstraint
                if AWS_REGION == 'us-east-1':
                    s3.create_bucket(Bucket=bucket_name)
                else:
                    s3.create_bucket(
                        Bucket=bucket_name,
                        CreateBucketConfiguration={'LocationConstraint': AWS_REGION}
                    )
                print(f"   ✅ Bucket créé.")
            else:
                raise e

        # 2. Activer le versioning (pour éviter pertes accidentelles)
        print(f"   🔄 Activation du versioning...")
        s3.put_bucket_versioning(
            Bucket=bucket_name,
            VersioningConfiguration={'Status': 'Enabled'}
        )

        # 3. Activer l'encryption (AES256 par défaut)
        print(f"   🔐 Activation de l'encryption...")
        s3.put_bucket_encryption(
            Bucket=bucket_name,
            ServerSideEncryptionConfiguration={
                'Rules': [
                    {
                        'ApplyServerSideEncryptionByDefault': {
                            'SSEAlgorithm': 'AES256'
                        },
                        'BucketKeyEnabled': True
                    }
                ]
            }
        )

        # 4. Bloquer l'accès public (sécurité)
        print(f"   🚫 Blocage accès public...")
        s3.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': True,
                'IgnorePublicAcls': True,
                'BlockPublicPolicy': True,
                'RestrictPublicBuckets': True
            }
        )

        # 5. Configuration CORS (pour upload depuis frontend)
        print(f"   🌐 Configuration CORS...")
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE'],
                    'AllowedOrigins': ['*'],  # À restreindre en prod
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }
        s3.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )

        # 6. Lifecycle policy (suppression auto des objets incomplets après 1 jour)
        print(f"   🗑️ Configuration Lifecycle...")
        s3.put_bucket_lifecycle_configuration(
            Bucket=bucket_name,
            LifecycleConfiguration={
                'Rules': [
                    {
                        'ID': 'DeleteIncompleteMultipartUploads',
                        'Status': 'Enabled',
                        'Prefix': '',
                        'AbortIncompleteMultipartUpload': {
                            'DaysAfterInitiation': 1
                        }
                    }
                ]
            }
        )

        print(f"   ✅ Bucket S3 configuré et sécurisé !")
        
        # Mise à jour .env
        update_env_file("AWS_S3_BUCKET_NAME", bucket_name)
        update_env_file("AWS_REGION", AWS_REGION)

        return bucket_name

    except (ClientError, EndpointConnectionError) as e:
        print(f"   ❌ Erreur S3: {e}")
        return None
    except Exception as e:
        print(f"   ❌ Erreur inattendue: {e}")
        return None

def main():
    print("🚀 Provisioning S3 Storage pour LimaJS...\n")
    try:
        bucket_name = create_s3_bucket()
        if bucket_name:
            print(f"\n🎉 Terminé ! Bucket S3 prêt: {bucket_name}")
            print("\n📁 Structure recommandée:")
            print("   - payments/           # Preuves de paiement")
            print("   - profile-photos/     # Photos de profil")
            print("   - bus-photos/         # Photos des bus")
            print("   - documents/          # Documents divers")
        else:
            print("\n❌ Échec de la création du bucket.")
    except Exception as e:
        print(f"\n❌ Erreur Globale: {e}")

if __name__ == '__main__':
    main()
