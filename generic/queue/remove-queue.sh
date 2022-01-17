export $(cat .env | xargs)
# ---------------------------------------------- #
kubectl config set-context --current --namespace=$QUEUE_NAMESPACE
echo "=> deleting queue cluster..."
kubectl delete rabbitmqcluster $QUEUE_CLUSTER_NAME
kubectl delete pvc persistence-rabbit-server-0
# ---------------------------------------------- #
echo "=> deleting service CA (root) cert from rabbit cluster..."
kubectl delete secret service-ca-cert
# ---------------------------------------------- #
echo "=> deleting client certificate (signed by service CA) to allow queue clients (functions) to authenticate themselves with the server..."
kubectl delete certificate queue-client --namespace openfaas-fn
kubectl delete secret $QUEUE_CLIENT_SECRET --namespace openfaas-fn
# ---------------------------------------------- #
echo "=> deleting queue's cert from functions..."
kubectl delete secret queue-cert --namespace openfaas-fn
# ---------------------------------------------- #
echo "=> deleting certificate and key for queue server tls..."
kubectl delete certificate queue
kubectl delete secret $QUEUE_SECRET
kubectl config set-context --current --namespace=default
kubectl delete namespace $QUEUE_NAMESPACE
# ---------------------------------------------- #
echo "=> deleting queue operator..."
kubectl delete deploy rabbitmq-cluster-operator --namespace rabbitmq-system
kubectl delete namespace rabbitmq-system
