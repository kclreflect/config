export $(cat .env | xargs)
# ---------------------------------------------- #
kubectl config set-context --current --namespace=openfaas
echo "=> deleting queue connector..."
kubectl delete deploy rabbitmq-connector
# ---------------------------------------------- #
echo "=> deleting configmaps..."
kubectl delete configmap rabbitmq-connector-configmap
kubectl delete configmap topology
# ---------------------------------------------- #
echo "=> deleting client certificate (signed by service CA) to allow client (rabbitmq-connector) to authenticate with the server..."
kubectl delete certificate queue-client
kubectl delete secret $QUEUE_CLIENT_SECRET
# ---------------------------------------------- #
echo "=> deleting queue's cert from functions..."
kubectl delete secret queue-cert
# ---------------------------------------------- #
echo "=> deleting gitlab container registry keys..."
kubectl delete secret gitlab-container-key
# ---------------------------------------------- #
echo "=> check removal of connector (and wait if still terminating):"
kubectl get pods
kubectl config set-context --current --namespace=default
