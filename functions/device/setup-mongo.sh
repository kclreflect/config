USER=$(echo $RANDOM | md5sum | head -c 10)
PASSWORD=$(echo $RANDOM | md5sum | head -c 10)
ROOT_PASSWORD=$(echo $RANDOM | md5sum | head -c 15)
export $(cat .env | xargs)
helm install $DB_NAMESPACE --set auth.rootPassword=$ROOT_PASSWORD,auth.usernames[0]=u$USER,auth.passwords[0]=$PASSWORD,auth.databases[0]=$DB_NAME,architecture=replicaset,replicaCount=2 --namespace $DB_NAMESPACE --create-namespace bitnami/mongodb 
echo "User: u"$USER;
echo "Password: "$PASSWORD;
echo "Root password: "$ROOT_PASSWORD
