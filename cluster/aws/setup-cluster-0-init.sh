export $(cat .env | xargs)
echo "WARN: setting up cluster which involves deleting existing. any key to continue. manually exit if not"
echo
# ---------------------------------------------- #
echo "deleting existing cluster..."
kops delete cluster --name=$CLUSTER_NAME --state s3://$STATE_BUCKET_NAME --yes
read -n 1 -s -r -p "WARN: cluster properly removed (or did not exist)? any key to continue. manually exit if no"
echo
# ---------------------------------------------- #
echo "clearing existing bucket..."
aws s3 rm s3://$STATE_BUCKET_NAME --recursive
aws s3api delete-objects --bucket $STATE_BUCKET_NAME --delete "$(aws s3api list-object-versions --bucket $STATE_BUCKET_NAME --output=json --query='{Objects: *[].{Key:Key,VersionId:VersionId}}')"; \
aws s3api delete-bucket --bucket $STATE_BUCKET_NAME --region $STATE_BUCKET_REGION
read -n 1 -s -r -p "WARN: bucket properly removed (or did not exist)? any key to continue. manually exit if no"
echo
# ---------------------------------------------- #
echo "creating bucket..."
aws s3api create-bucket --bucket $STATE_BUCKET_NAME --region $STATE_BUCKET_REGION --create-bucket-configuration LocationConstraint=$STATE_BUCKET_REGION
aws s3api put-bucket-versioning --bucket $STATE_BUCKET_NAME --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket $STATE_BUCKET_NAME --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
# ---------------------------------------------- #
echo "creating cluster..."
kops create cluster --name $CLUSTER_NAME --zones $CLUSTER_REGION --topology private --networking kube-router --bastion --ssh-public-key $HOST_PUBLIC_KEY_PATH --admin-access $VPN_CIDR --state s3://$STATE_BUCKET_NAME --cloud aws --yes 
echo "shortly validate with: kops validate cluster --state=s3://"$STATE_BUCKET_NAME
