export $(cat .env | xargs)
echo "=> installing and running minikube..."
ssh -o IdentitiesOnly=yes -i $SSH_KEY $SERVER_USER@$SERVER_ADDRESS < ./setup-minikube.sh
./connect-minikube.sh
echo "=> starting minikube tunnel, in background, on server..."
ssh -o IdentitiesOnly=yes -i $SSH_KEY $SERVER_USER@$SERVER_ADDRESS 'minikube tunnel >/home/'${SERVER_USER}'/out.log 2>/home/'${SERVER_USER}'/err.log &'
