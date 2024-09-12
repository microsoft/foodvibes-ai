typeset slug="Key Vault setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 0 "$slug"

set_key_vault_secret() {
    local log_level=${1:-0}
    local key_vault_name=$2
    local secret_name=$3
    local secret_value="$4"
    local rc=1

    [[ -n "$key_vault_name" && -n "$secret_name" ]] &&
        {
            [[ -z "$secret_value" ]] && secret_value=" "
            ((log_level < 0)) && set -xv
            az keyvault secret set --vault-name $key_vault_name --name $secret_name --value "$secret_value" >/dev/null &&
                rc=$?
            set +xv
        }

    return $rc
}

set_key_vault_secret_all() {
    local log_level=${1:-0}
    local entra_id_app_name=${2}
    local key_vault_name=${3}
    local database_server=${4}
    local database_name=${5}
    local blob_storage_acct=${6}
    local blob_container_name=${7}
    local adma_base_url=${8}
    local adma_party_id=${9}
    local adma_authority=${10}
    local adma_client_id=${11}
    local adma_client_secret=${12}
    local farmvibes_url=${13}
    local bingmaps_api_key=${14}
    local foodvibes_app_insights_instrumentation_key=${15}
    local database_username=${16}
    local database_password=${17}
    local app_id=$(get_entra_id_app_id $entra_id_app_name)
    local connection_string="Driver={ODBC Driver 18 for SQL Server};Server=tcp:${database_server}.database.windows.net,1433;Database=${database_name};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30"
    local images_blob_url="https://${blob_storage_acct}.blob.core.windows.net"

    [[ -n $database_username && -n $database_password ]] &&
        connection_string="${connection_string};uid=${database_username};pwd=${database_password}"

    set_key_vault_secret $log_level $key_vault_name foodvibes-connection-string "$connection_string" &&
        set_key_vault_secret $log_level $key_vault_name images-blob-storage-acct "$blob_storage_acct" &&
        set_key_vault_secret $log_level $key_vault_name images-blob-service-url "$images_blob_url" &&
        set_key_vault_secret $log_level $key_vault_name adma-base-url "$adma_base_url" &&
        set_key_vault_secret $log_level $key_vault_name adma-party-id "$adma_party_id" &&
        set_key_vault_secret $log_level $key_vault_name adma-authority "$adma_authority" &&
        set_key_vault_secret $log_level $key_vault_name adma-client-id "$adma_client_id" &&
        set_key_vault_secret $log_level $key_vault_name adma-client-secret "$adma_client_secret" &&
        set_key_vault_secret $log_level $key_vault_name database-name "$database_name" &&
        set_key_vault_secret $log_level $key_vault_name database-server "$database_server" &&
        set_key_vault_secret $log_level $key_vault_name database-username "$database_username" &&
        set_key_vault_secret $log_level $key_vault_name database-password "$database_password" &&
        set_key_vault_secret $log_level $key_vault_name farmvibes-url "$farmvibes_url" &&
        set_key_vault_secret $log_level $key_vault_name bingmaps-api-key "$bingmaps_api_key" &&
        set_key_vault_secret $log_level $key_vault_name entra-id-client-id "$app_id" &&
        set_key_vault_secret $log_level $key_vault_name foodvibes-app-insights-instrumentation-key "$foodvibes_app_insights_instrumentation_key" &&
        set_key_vault_secret $log_level $key_vault_name images-blob-container-name "$blob_container_name"

    return $?
}

upload_images_to_blob() {
    local blob_container_name=$1
    local blob_storage_acct=$2
    local subfolder=$3
    local rc=1

    [[ -n $blob_container_name && -n $blob_storage_acct ]] &&
        {
            logger 1 "Uploading sample images to container \"$blob_container_name\" in storage account \"$blob_storage_acct\"..."

            find "$here/image-samples/${subfolder}/" -type f | while read file; do
                [[ -f "$file" ]] &&
                    {
                        typeset blob=$(echo $file | sed -e 's,.*/image-samples/,,')

                        logger 0 "Uploading ${file} to blob storage ${blob_container_name}/${blob}..."
                        ((log_level < 0)) && set -xv
                        az storage blob upload --account-name "$blob_storage_acct" --container-name "$blob_container_name" --name "$blob" --file "$file" --overwrite >/dev/null 2>&1
                        rc=$?
                        set +xv

                        ((rc == 0)) || return 1
                    }
            done
            rc=0
        }

    return $rc
}

(($rc == 0)) && [[ -f "$env_file" && -n "$resource_group_name" && -n "$resource_group_location" && -n "$entra_id_app_name" && -n "$key_vault_name" ]] && {
    rc=1
    if [[ $(az group exists --name $resource_group_name) == 'true' ]]; then
        logger 1 "Found existing resource group \"$resource_group_name\" in ${resource_group_location}"
        rc=0
    else
        logger 0 "Creating resource group \"$resource_group_name\" in ${resource_group_location}..."
        ((log_level < 0)) && set -xv
        az group create --name $resource_group_name --location "$resource_group_location" --tags "FoodVibes oss deployment" >/dev/null 2>&1
        rc=$?
        set +xv
        logger -1 "\n$(az group show --name $resource_group_name)\n$(az group show --name $resource_group_name)"
    fi

    (($rc == 0)) &&
        {
            rc=1

            typeset entra_id_app_id=$(get_entra_id_app_id $entra_id_app_name)

            [[ -z "${entra_id_app_id}" ]] && {
                logger 0 "Creating app registration \"$entra_id_app_name\"..."
                ((log_level < 0)) && set -xv
                entra_id_app_id=$(
                    az ad app create \
                        --display-name "${entra_id_app_name}" \
                        --sign-in-audience "AzureADMyOrg" \
                        --query "appId" --output tsv
                )
                rc=$?
                set +xv

                (($rc == 0)) &&
                    {
                        rc=1
                        typeset tmpfile=$(mktemp)
                        ((log_level < 0)) && set -xv
                        az ad app show --id $entra_id_app_id --query="spa" --output json | sed -e 's,"redirectUris": \[\],"redirectUris": ["http://localhost:3000"],' >$tmpfile &&
                            {
                                set +xv
                                logger -1 "SPA config\n$(cat $tmpfile)" &&
                                    {
                                        ((log_level < 0)) && set -xv
                                        az ad app update --id $entra_id_app_id --set spa=@$tmpfile &&
                                            rm -f $tmpfile
                                    } &&
                                    {
                                        set +xv
                                        # Assign API permissions
                                        apiId="00000003-0000-0000-c000-000000000000"        # Microsoft Graph
                                        permissionId="311a71cc-e848-46a1-bdf8-97ff7156d8e6" # User.Read permission
                                        ((log_level < 0)) && set -xv
                                        az ad app permission add --id $entra_id_app_id --api $apiId --api-permissions $permissionId=Scope
                                    } &&
                                    {
                                        set +xv
                                        logger 0 "App registration \"$entra_id_app_name\" created with ID \"$entra_id_app_id\". Creating service principal..."
                                        ((log_level < 0)) && set -xv
                                        az ad sp create --id $entra_id_app_id >/dev/null 2>&1
                                    }
                            }
                    }
                set +xv
            }

            [[ -n "${entra_id_app_id}" ]] && {
                {
                    set +xv
                    typeset client_id=$(az ad app show --id $entra_id_app_id --query appId --output tsv)
                    typeset tenant_id=$(az account show --query tenantId --output tsv)

                    logger 0 "Applying Client ID \"$client_id\" and Tenant ID \"$tenant_id\" to UI environment file..."

                    set_env_file_entry VITE_CLIENT_ID "$client_id" $env_file_ui &&
                        set_env_file_entry VITE_AUTHORITY "https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/authorize" $env_file_ui &&
                        logger -1 "UI environment file updated: $env_file_ui"
                    logger -1 "\n$(cat $env_file_ui)"
                }

                rc=$?
            }

            (($rc == 0)) && {
                rc=1

                logger 0 "Getting service principal for $username..."
                typeset user_principal_name_rec="$(az ad user list --query "[].{UserPrincipalName:userPrincipalName, Name:displayName}" --output table)"
                typeset user_principal_name=$(echo "$user_principal_name_rec" | egrep "^$(echo "${username}" | sed -e 's/@/_/g')#|$username" | head -1 | awk '{print $1}')

                if [[ -z "$user_principal_name" ]]; then
                    logger 2 "Failed to get user principal name for $username"
                else
                    logger 1 "User principal name is \"$user_principal_name\""
                    logger 1 "Configuring Key Vault \"$key_vault_name\"..."
                    set_env_file_entry KEY_VAULT_NAME "$key_vault_name" $env_file
                    ((log_level < 0)) && set -xv
                    check_if_key_vault_exists $key_vault_name 1 || {
                        set +xv
                        logger 0 "Creating key vault \"$key_vault_name\" in resource group \"$resource_group_name\"..."
                        ((log_level < 0)) && set -xv
                        az keyvault create --name $key_vault_name --resource-group $resource_group_name --location "$resource_group_location" --output none
                        rc=$?
                    } && {
                        set +xv
                        rc=0
                    }

                    (($rc == 0)) &&
                        {
                            set +xv
                            typeset -i retries=10
                            typeset rbac_output=""

                            logger 0 "Assigning role \"Key Vault Secrets Officer\" to user principal \"$user_principal_name\"..."

                            while ((retries > 0)); do
                                ((--retries))

                                ((log_level < 0)) && set -xv
                                az role assignment create --role "Key Vault Secrets Officer" --assignee $user_principal_name --scope \
                                    "/subscriptions/${subscription_id}/resourceGroups/${resource_group_name}/providers/Microsoft.KeyVault/vaults/${key_vault_name}" >/dev/null
                                rc=$?
                                set +xv

                                if (($rc == 0)); then
                                    retries=0
                                    rc=0
                                elif ((retries == 0)); then
                                    logger 2 "Failed to assign role to user principal \"$user_principal_name\""
                                else
                                    logger 0 "Awaiting key vault propagation before assignment of RBAC (retry count left ${retries})..."
                                    sleep 10
                                fi
                            done
                        }
                    (($rc == 0)) &&
                        {
                            rc=1

                            typeset -i retries=10
                            typeset rbac_output=""

                            logger 0 "Setting Key Vault secrets..."

                            while ((retries > 0)); do
                                ((--retries))

                                set_key_vault_secret_all \
                                    $log_level \
                                    "$entra_id_app_name" \
                                    "$key_vault_name" \
                                    "$database_server" \
                                    "$database_name" \
                                    "$blob_storage_acct" \
                                    "$blob_container_name" \
                                    "$adma_base_url" \
                                    "$adma_party_id" \
                                    "$adma_authority" \
                                    "$adma_client_id" \
                                    "$adma_client_secret" \
                                    "$farmvibes_url" \
                                    "$bingmaps_api_key" \
                                    "$foodvibes_app_insights_instrumentation_key" \
                                    "$database_username" \
                                    "$database_password"

                                if (($? == 0)); then
                                    retries=0
                                    rc=0
                                elif ((retries == 0)); then
                                    logger 2 "Failed to set Key Vault secrets"
                                else
                                    logger 0 "Awaiting key vault propagation before setting secrets (retry count left ${retries})..."
                                    sleep 10
                                fi
                            done
                        }
                    (($rc == 0)) &&
                        logger 0 "Checking Key Vault entries..." &&
                        logger 1 "Key Vault\n$(get_key_vault_secret_all $key_vault_name 1)" &&
                        {
                            rc=1

                            if [[ -z "$blob_container_name" || -z "$blob_storage_acct" ]]; then
                                logger 2 "Images BLOB storage configuration is missing"
                                rc=1
                            else
                                logger 0 "Provisioning Azure BLOB storage using storage account \"$blob_storage_acct\" and container \"$blob_container_name\"..."
                                ((log_level < 0)) && set -xv
                                az provider register --namespace Microsoft.Storage &&
                                    az account set --subscription "$subscription_id" &&
                                    {
                                        set +xv

                                        typeset -i retries=10
                                        typeset createaccount=1

                                        while ((retries > 0 && createaccount == 1)); do
                                            ((--retries))

                                            ((log_level < 0)) && set -xv
                                            if [[ "$(az storage account check-name --name "$blob_storage_acct" --query "nameAvailable")" == "false" ]]; then
                                                # We get here if the storage account already exists. Check if it is in our resource group.
                                                if (($(az storage account list --output table | grep "$blob_storage_acct" | wc -l) > 0)); then
                                                    set +xv
                                                    logger 1 "Storage account \"$blob_storage_acct\" already exists in resource group \"$resource_group_name\" and will be used"

                                                    createaccount=0
                                                    rc=0
                                                else
                                                    set +xv
                                                    # The storage account exists but is not in our resource group. We need to create a new one.
                                                    blob_storage_acct=$(make_storage_acct_name $env_file) # Attempt to create a unique storage account name
                                                fi
                                            else
                                                set +xv
                                                retries=0
                                                rc=0
                                            fi
                                        done

                                        (($rc == 0 && $createaccount == 1)) &&
                                            {
                                                rc=1
                                                {
                                                    set +xv
                                                    logger 0 "Creating storage account \"$blob_storage_acct\" in resource group \"$resource_group_name\"..."
                                                    ((log_level < 0)) && set -xv
                                                    az storage account create --name "$blob_storage_acct" --resource-group $resource_group_name --location "$resource_group_location" --sku Standard_LRS >/dev/null &&
                                                        az role assignment create --role "Storage Blob Data Contributor" --assignee $user_principal_name --scope \
                                                            "/subscriptions/${subscription_id}/resourceGroups/${resource_group_name}/providers/Microsoft.Storage/storageAccounts/$blob_storage_acct" >/dev/null
                                                } &&
                                                    {
                                                        set +xv
                                                        logger 0 "Creating container \"$blob_container_name\" in storage account \"$blob_storage_acct\"..."
                                                        ((log_level < 0)) && set -xv
                                                        az storage container create --account-name "$blob_storage_acct" --name "$blob_container_name"
                                                        rc=$?
                                                    }
                                            }

                                        set +xv
                                        ((rc == 0)) &&
                                            {
                                                upload_images_to_blob "$blob_container_name" "$blob_storage_acct" "geotrack" &&
                                                    upload_images_to_blob "$blob_container_name" "$blob_storage_acct" "product"
                                            }
                                    }
                                set +xv
                            fi
                        }
                fi
            }
        }
}

check_status $rc "${slug}"
