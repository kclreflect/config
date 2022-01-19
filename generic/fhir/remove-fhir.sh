export $(cat ${1:-.env} | xargs)
kubectl config set-context --current --namespace=$FHIR_NAMESPACE
# ---------------------------------------------- #
echo "=> deleting certificates..."
kubectl delete certificate fhir-tls
kubectl delete secret fhir-tls
# ---------------------------------------------- #
echo "=> deleting ingress resource for fhir server..."
kubectl delete ingress fhir
# ---------------------------------------------- #
echo "=> removing fhir server storage..."
kubectl delete statefulset hapi-fhir-jpaserver-postgresql
kubectl delete pvc data-hapi-fhir-jpaserver-postgresql-0
# ---------------------------------------------- #
echo "=> deleting deployment for fhir server..."
kubectl delete deploy hapi-fhir-jpaserver
# ---------------------------------------------- #
echo "=> deleting fhir server..."
helm uninstall hapi-fhir-jpaserver
# ---------------------------------------------- #
kubectl config set-context --current --namespace=default
