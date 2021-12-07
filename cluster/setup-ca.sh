export $(cat .env | xargs)
helm repo add jetstack https://charts.jetstack.io
helm repo update
# ---------------------------------------------- #
echo "installing cert manager..."
helm install cert-manager --namespace cert-manager --create-namespace --set installCRDs=true --version v1.6 jetstack/cert-manager
# ---------------------------------------------- #
echo "generating CA certificate and key..."
rm tls.key
rm tls.pem
openssl genrsa -out tls.key 4096
openssl req -x509 -new -nodes -subj "${CA_SUBJECT_STRING}" -key tls.key -sha256 -days 1825 -out tls.pem
# ---------------------------------------------- #
echo "creating secrets to store these credentials..."
kubectl create secret tls ca-key-pair --key="tls.key" --cert="tls.pem" --namespace cert-manager
# ---------------------------------------------- #
echo "creating CA..."
kubectl create -f ./cert-manager/internal-issuer.yaml
kubectl describe clusterissuer ca-issuer
