export $(cat .env | xargs)
echo "about to install openfaas..."
sleep 5
kubectl apply -f https://raw.githubusercontent.com/openfaas/faas-netes/master/namespaces.yml
helm upgrade openfaas --install openfaas/openfaas --namespace openfaas --set functionNamespace=openfaas-fn --set generateBasicAuth=true
PASSWORD=$(kubectl -n openfaas get secret basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode) 
echo "openFaaS admin password: $PASSWORD"
echo "about to install cert manager..."
sleep 5
helm install cert-manager --namespace cert-manager --create-namespace --set installCRDs=true --version v1.6 jetstack/cert-manager
# kubectl create -f ./cert-manager/prod-issuer.yaml 
sed -e 's|CERT_EMAIL|'"${CERT_EMAIL}"'|g' ./cert-manager/prod-issuer.yaml | kubectl create -f -
kubectl describe clusterissuer letsencrypt-prod -n cert-manager
echo "about to install ingress resource..."
sleep 5
# kubectl create -f ./cert-manager/ingress-tls.yaml --namespace openfaas 
sed -e 's|OPENFAAS_API_URL|'"${OPENFAAS_API_URL}"'|g' ./cert-manager/ingress-tls.yaml | kubectl create -f - --namespace openfaas # create ingress resource for openfaas (which communicates with the controller; one controller many resources)
# create ingress resource for openfaas (which communicates with the controller; one controller many resources)
echo "waiting for certificates to generate (might take longer than this wait)..."
sleep 30
kubectl get certificate --namespace openfaas
sleep 3
kubectl describe certificate api-tls --namespace openfaas 
kubectl describe secret api-tls --namespace openfaas
echo "setting up gitlab container registry keys..."
sleep 5
kubectl create secret docker-registry gitlab-container-key --docker-server=$DOCKER_SERVER --docker-username=$DOCKER_USERNAME --docker-password=$DOCKER_PASSWORD --docker-email=$DOCKER_EMAIL --namespace openfaas-fn
kubectl get secrets gitlab-container-key --namespace openfaas-fn
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "gitlab-container-key"}]}' -n openfaas-fn
echo "warn: login locally to Gitlab (in addition to the keys on Kubernetes being set), in order to push from faas-cli"
echo "logging in to openfaas API..."
faas-cli login --gateway https://$OPENFAAS_API_URL --username admin --password $PASSWORD
