helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add openfaas https://openfaas.github.io/faas-netes/
helm repo add jetstack https://charts.jetstack.io
helm repo update
echo "about to create load balancer..."
sleep 5
helm install nginx-ingress-controller ingress-nginx/ingress-nginx  # create load balancer (ingress controller)
echo "now associate load balancer with address for openfaas API in DNS (CNAME), confirm reachable and then run script (1)"
