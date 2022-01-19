export $(cat .env | xargs)
# ---------------------------------------------- #
export KOPS_FEATURE_FLAGS="+APIServerNodes"
echo "=> replicating api server (using kops instance resource)..."
sed -e 's|CLUSTER_NAME|'"${CLUSTER_NAME}"'|g' ./objects/kops-apiserver-instancegroup.yml | sed -e 's|CLUSTER_REGION|'"${CLUSTER_REGION}"'|g' - | kops create --state s3://$STATE_BUCKET_NAME -f -
# ---------------------------------------------- #
echo "=> running cluster updates..."
kops update cluster --yes --state s3://$STATE_BUCKET_NAME
read -n 1 -s -r -p "=> WARN: rolling update requires connection to api server. request forwarding in place? any key to continue. manually exit if not"
echo
kops rolling-update cluster --yes --state s3://$STATE_BUCKET_NAME
# ---------------------------------------------- #
echo "=> now ensure apiserver replicas are running:"
kubectl get pods -n kube-system
