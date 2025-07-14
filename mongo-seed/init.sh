#!/bin/bash

USERNAME=root
PASSWORD=example
AUTH_DB=admin
DB=product-search
COLLECTION=products
DIR=/seed

until mongosh --host mongo --username "$USERNAME" --password "$PASSWORD" --authenticationDatabase "$AUTH_DB" --eval "db.adminCommand('ping')" > /dev/null 2>&1
do
    echo "Aguardando o MongoDB ficar pronto..."
    sleep 2
done

for file in $DIR/products_*.json; do
    echo "Importando $file..."
    mongoimport --host mongo --username $USERNAME --password $PASSWORD --authenticationDatabase "$AUTH_DB" \
    --db "$DB" --collection "$COLLECTION" --file "$file" --jsonArray
done