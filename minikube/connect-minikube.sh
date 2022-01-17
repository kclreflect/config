export $(cat .env | xargs)
echo "=> connecting kubectl to minikube..."
ssh -o IdentitiesOnly=yes -i $SSH_KEY $SERVER_USER@$SERVER_ADDRESS 'docker exec minikube cat /etc/kubernetes/admin.conf' | sed -e 's|control-plane.minikube.internal|'${CLUSTER_ADDRESS}'|g' - > ~/.kube/config-mini
sudo chmod go-r ~/.kube/config-mini
export KUBECONFIG=~/.kube/config-mini
kubectl get pods -A
