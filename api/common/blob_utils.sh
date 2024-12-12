#!/bin/bash

# Variables
account_name="farmvibesllm6285804596"
container_name="azureml-blobstore-96d2e54b-9c8f-4ea9-b777-c74825e52a83"
base_url="https://$account_name.blob.core.windows.net/$container_name"
auth_mode="login"

#Function to list all blobs without 5000 limit
list_all_blobs() {
    marker=":NONE:"

    # Loop to handle pagination and append results to the file
    while [[ -n "$(echo $marker | grep -v "null")" ]]; do
        results=$(
            az storage blob list \
                --account-name $account_name \
                --container-name $container_name \
                --auth-mode $auth_mode \
                --prefix $1 \
                --num-results 5000 \
                --query "[].{name:name, lastModified:properties.lastModified}" \
                --marker "$(echo $marker | grep -v ":NONE:")" \
                --delimiter "/" \
                -o tsv 2>&1
        )
        blobs=$(echo "$results" | grep -v "^WARNING:")
        marker=$(echo "$results" | grep "^WARNING:" | sed -n 2p | cut -d" " -f2-)
        echo "$blobs"
    done
}

# Function download blob
download_blob() {
    local blob_name=$1
    local file_path="./data/staging/$(echo $blob_name | sed 's/\//_/g')"

    az storage blob download --account-name $account_name --container-name $container_name --name $blob_name --file $file_path --auth-mode $auth_mode &&
        echo "$file_path"
}

if [[ -n $(echo "$1" | grep '\.jsonl$') ]]; then
    download_blob "$1"
else
    list_all_blobs "${1:-farmvibes-llm-pipelines/}"
fi
