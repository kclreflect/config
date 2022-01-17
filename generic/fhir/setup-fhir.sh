export $(cat ${1:-.env} | xargs)
helm repo add hapifhir https://hapifhir.github.io/hapi-fhir-jpaserver-starter/
helm repo update
# ---------------------------------------------- #
echo "=> installing fhir server..."
helm install --create-namespace --render-subchart-notes hapi-fhir-jpaserver hapifhir/hapi-fhir-jpaserver --namespace $FHIR_NAMESPACE # ~mdc don't upgrade, due to postgres issue 
kubectl config set-context --current --namespace=$FHIR_NAMESPACE
# ---------------------------------------------- #
echo "=> adding ingress resource for fhir server..."
sed -e 's|INTERNAL_API_URL|'"${INTERNAL_API_URL}"'|g' ./objects/ingress-tls-fhir.yaml | kubectl create -f -
# ---------------------------------------------- #
echo "=> waiting for certificates to generate (might take longer than this wait)..."
sleep 10
kubectl get certificate
sleep 3
kubectl describe certificate fhir-tls
kubectl describe secret fhir-tls
echo "=> INFO: CA cert is here if useful^"
# ---------------------------------------------- #
echo "=> waiting for fhir server to start..."
sleep 90
kubectl logs deployment/hapi-fhir-jpaserver
kubectl config set-context --current --namespace=default
kubectl port-forward "service/hapi-fhir-jpaserver" 8080 --namespace $FHIR_NAMESPACE
