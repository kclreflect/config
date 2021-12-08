export $(cat .env | xargs)
# ---------------------------------------------- #
echo "=> installing fhir server..."
helm install --namespace $FHIR_NAMESPACE --create-namespace --render-subchart-notes hapi-fhir-jpaserver hapifhir/hapi-fhir-jpaserver
# ---------------------------------------------- #
echo "=> adding ingress resource for fhir server..."
sed -e 's|INTERNAL_API_URL|'"${INTERNAL_API_URL}"'|g' ./objects/ingress-tls-fhir.yaml | kubectl create -f - --namespace $FHIR_NAMESPACE 
# ---------------------------------------------- #
echo "=> waiting for certificates to generate (might take longer than this wait)..."
sleep 30
kubectl get certificate --namespace $FHIR_NAMESPACE
sleep 3
kubectl describe certificate fhir-tls --namespace $FHIR_NAMESPACE 
kubectl describe secret fhir-tls --namespace $FHIR_NAMESPACE
echo "=> INFO: CA cert is here if useful^"
