typeset -i rc=0
typeset -i log_level=${1:-0}
typeset -i main_script=${2:-0}
typeset -i fast_track=${3:-0}
typeset slug=${4:-FoodVibes.ai Setup}
typeset -i password_length=10

logger() {
    typeset -i level=${1:-0} # -1: debug/0: normal/1: good/2: bad

    (($level < $log_level)) && return 0

    typeset prefix="0"
    typeset midfix=" "

    case "$1" in
    -1)
        prefix="34" # blue
        midfix=" - DEBUG - "
        ;;
    1)
        prefix="32" # green
        midfix=" - INFO - "
        ;;
    2)
        prefix="31" # red
        midfix=" - ERROR - "
        ;;
    *)
        prefix="33"
        ;;
    esac

    shift 1
    echo -e "\033[0m\033[${prefix}m$(date +"%Y-%m-%d %H:%M:%S,%3N")${midfix}$*\033[0m" >&2
}

check_status() {
    local -i rc_to_check=$1
    local message="$2"
    local flag=2
    local suffix="failed"

    ((rc_to_check == 0)) && {
        flag=1
        suffix="completed"
    }

    logger $flag "${message} ${suffix}"

    return $rc_to_check
}

run_cmd_conditional_check() {
    local skip_check=${1:-0}
    shift 1

    logger 0 "Running: $*"
    eval "$*"
    local rc=$?

    if (($skip_check == 0)); then
        check_status $rc "Command \033[0m\033[33m\033[1m$*\033[0m"
        rc=$?
    else
        rc=0
    fi

    return $rc
}

run_cmd() {
    run_cmd_conditional_check 0 $*

    return $?
}

get_value() {
    local default_value=$1 # $3-: prompt message
    local mask_flag=${2:-0}
    local answer
    local default_value_display=""

    [[ -n "$default_value" ]] && default_value_display=" [$(mask_value "${default_value}" "" $mask_flag)]"

    shift 2
    read -p "$*${default_value_display}: " answer
    echo "${answer:-${default_value}}"
}

get_value_boolean() {
    local default_value=$1 # $2-: prompt message
    shift 1
    answer=$(get_value "$default_value" 0 $*)

    case $answer in
    [Yy1Tt]*)
        echo 1
        ;;
    *)
        echo 0
        ;;
    esac
}

get_absolute_path() {
    local path=$1
    local basename=$(basename $path)

    echo "$(cd ${path%$basename} && pwd)/$basename"
}

get_env_file_entry() {
    local key=$1
    local env_file=$2
    local default_value="$3"
    local output=$(grep "^${key}=" ${env_file} | cut -d= -f2- | sed -e 's/"//g' -e 's/\r//g')
    echo "${output:-${default_value}}"
}

set_env_file_entry() {
    local key=$1
    local value="$2"
    local env_file=$3

    {
        grep -v "^${key}=" ${env_file}
        echo "${key}=\"${value}\"" | sed -e 's/\r//g'
    } >${env_file}.tmp && mv ${env_file}.tmp ${env_file} || {
        logger 2 "Failed to set key $key in ${env_file}"
        return 1
    }

    logger -1 "Key $key set in ${env_file}"
    return 0
}

database_check_if_exists() {
    local resource_group_name="$1"
    local database_server="$2"
    local database_name="$3"
    local silent=${4:-1}
    local rc=1

    # Check if the SQL Database exists
    databaseExists=$(az sql db list --resource-group $resource_group_name --server $database_server --query "[?name=='$database_name'] | length(@)")

    (($databaseExists == 1)) &&
    {
        logger 1 "SQL Database \"$database_name\" exists on server \"$database_server\" in resource group \"$resource_group_name\""
        rc=0
    }

    (($rc != 0 && $silent == 0)) &&
        logger 2 "SQL Database \"$database_name\" NOT found exists on server \"$database_server\" in resource group \"$resource_group_name\""

    return $rc
}

database_update_firewall_rules() {
    local resource_group_name="$1"
    local database_server="$2"
    local ipaddr="$(curl -4 ifconfig.me 2>/dev/null)"
    local rc=1

    if [[ -z $ipaddr ]]; then
        logger 2 "IP address could not be found"
    else
        local rule_name="AllowYourIP_${ipaddr}"

        logger 0 "Checking firewall for rule \"$rule_name\"..."
        ((log_level < 0)) && set -xv
        az sql server firewall-rule show --resource-group $resource_group_name --server $database_server --name $rule_name >/dev/null 2>&1
        rc=$?
        set +xv

        (($rc != 0)) &&
            {
                logger 0 "Creating firewall rule for IP address ${ipaddr}..."

                ((log_level < 0)) && set -xv
                az sql server firewall-rule create --resource-group $resource_group_name --server $database_server --name $rule_name --start-ip-address $ipaddr --end-ip-address $ipaddr
                rc=$?
                set +xv
            }

        if (($rc == 0)); then
            logger 1 "Firewall rule \"$rule_name\" has been verified"
        else
            logger 2 "Firewall rule \"$rule_name\" has NOT been verified"
        fi
    fi

    return $rc
}

get_entra_id_app_id() {
    local app_name=$1

    echo "$(az ad app list --query "[?displayName=='${app_name}'].appId" --output tsv)"
}

remove_entra_id_spa_app() {
    local old_entra_id_app_name=$1

    [[ -n "$old_entra_id_app_name" ]] &&
        {
            logger 0 "Locating app registration \"$old_entra_id_app_name\"..."

            local old_entra_id_app_id=$(get_entra_id_app_id $old_entra_id_app_name)

            [[ -n "$old_entra_id_app_id" ]] &&
                {
                    logger 0 "Deleting app registration \"$old_entra_id_app_name\"..."
                    ((log_level < 0)) && set -xv
                    az ad sp delete --id $old_entra_id_app_id >/dev/null 2>&1
                    az ad app delete --id $old_entra_id_app_id >/dev/null 2>&1
                    set +xv

                    logger 1 "Removed Entra ID App \"$old_entra_id_app_name\""
                }
        }
}

reset_env_files() {
    local forced=${1:-0}
    local env_file=$2
    local env_file_ui=$3
    local rc=1

    if [[ $forced == 1 || ! -f $env_file ]]; then
        logger 0 "Resetting $env_file..."
        cat >$env_file <<EOS
FETCH_PAGE_SIZE=10
#ENVIRONMENT="production"
ENVIRONMENT="development"
# -- Cut below this line before shipping --
EOS
        rc=$?
    else
        rc=0
    fi

    (($rc == 0)) && [[ $forced == 1 || ! -f $env_file_ui ]] &&
        {
            logger 0 "Resetting $env_file_ui..."
            cat >$env_file_ui <<EOS
VITE_ENDPOINT_URL=http://localhost:7478
# VITE_CLIENT_ID is Application (client) ID
# VITE_AUTHORITY is Directory (tenant) ID
# -- Cut below this line before shipping --
EOS
            rc=$?
        }

    return $rc
}

format_boolen_status() {
    local -i bool_val=${1:-0}
    local good_tag="${2:-good}"
    local bad_tag="${3:-bad}"

    if (($bool_val == 1)); then
        echo $good_tag
    else
        echo $bad_tag
    fi
}

check_if_env_file_is_clean() {
    local env_file=$1
    local token=$2

    if [[ -f "$env_file" && -z "$(grep "^${token}=" $env_file)" ]]; then
        logger 1 "File $env_file is clean"
        return 0
    else
        logger 2 "File $env_file is NOT clean"
        return 1
    fi
}

get_set_file_entry() {
    local key=$1
    local var_name=$2
    local env_file=$3
    local default_value="$4"
    local tag="$5"
    local prompt=${6:-0}
    local mask_flag=${7:-0}
    local value_in_envfile=0

    eval local value=\"\$$var_name\"

    [[ -z "$value" ]] && value=$(get_env_file_entry "$key" "$env_file" "$default_value")
    [[ -n "$tag" ]] && (($prompt == 1)) && value="$(get_value "$value" "$mask_flag" "Enter ${tag}")"

    eval $var_name=\"$value\"
    set_env_file_entry "$key" "$value" $env_file

    return $?
}

check_if_key_vault_exists() {
    local rc=1
    local key_vault=$1
    local silent=${2:-0}

    logger 0 "Checking if key vault \"$key_vault\" exists..."
    az keyvault show --name $key_vault >/dev/null 2>&1
    rc=$?

    (($rc != 0 && $silent == 0)) && logger 2 "Key vault \"$key_vault\" was not found"

    return $rc
}

get_key_vault_secret_sub() {
    local secret_name=$1
    local secret_value="$2"
    local apply_mask=${3:-0}

    if [[ $apply_mask -gt 0 && -n $(echo "@database-password@adma-client-secret@" | grep "@${secret_name}@") ]]; then
        mask_value "$secret_value" "" 2
    elif [[ $apply_mask -gt 0 && -n $(echo "@bingmaps-api-key@foodvibes-app-insights-instrumentation-key@adma-authority@" | grep "@${secret_name}@") ]]; then
        mask_value "$secret_value" "" 1
    elif [[ $apply_mask -gt 0 && -n $(echo "@foodvibes-connection-string@" | grep "@${secret_name}@") ]]; then
        local final_value=""
        local -a flds
        IFS=';' read -r -a flds <<<"$secret_value"

        for element in "${flds[@]}"; do
            [[ $element == pwd=* ]] && element="$(echo $element | cut -d= -f1)=$(mask_value "$(echo $element | cut -d= -f2-)" "" 2)"
            final_value="${final_value};${element}"
        done
        #
        echo "$final_value"
    else
        echo "$secret_value"
    fi
}

get_key_vault_secret() {
    local secret_name=$1
    local default_value=$2
    local secret_recs="$3"
    local apply_mask=${4:-0}
    local secret_value=$(echo "$secret_recs" | grep "^${secret_name}=" | cut -d= -f2- | sed -e 's/"//g' -e 's/\r//g')
    local final_value="${secret_value:-${default_value}}"

    get_key_vault_secret_sub "$secret_name" "$final_value" $apply_mask
}

get_key_vault_secret_all() {
    local key_vault=$1
    local apply_mask=${2:-0}
    local secret_names=$(az keyvault secret list --vault-name $key_vault --query "[].name" -o tsv | sed -e 's/\r//g' 2>/dev/null)

    for secret_name in $secret_names; do
        secret_value="$(get_key_vault_secret_sub "$secret_name" "$(az keyvault secret show --name "$secret_name" --vault-name $key_vault --query "value" -o tsv)" $apply_mask)"
        echo "${secret_name}=${secret_value}"
    done
}

get_unique_id() {
    date +"-%H:%M:%S-%8N-%Y-%m-%d-%H:%M:%S-%8N" | sed -e 's/[-:]//g'
}

truncate_unique_id() {
    local input=${1:-$(get_unique_id)}
    local maxlen=${2:-24}

    echo "$(echo "$input" | cut -c1-$(($maxlen - 1)))z"
}

make_storage_acct_name() {
    local env_file=$1
    local suffix=${2:-$(get_unique_id)}
    local output="$(get_env_file_entry BLOB_STORAGE_ACCT $env_file $(truncate_unique_id "fv-ssa-${suffix}"))"

    set_env_file_entry BLOB_STORAGE_ACCT "$output" $env_file &&
        echo "${output}"
}

generate_password() {
    local password

    # Ensure the password contains at least one upper, one lower, one digit, and one special character
    while true; do
        password=$(tr -dc 'A-Za-z0-9!@#%_+|:=' </dev/urandom | head -c $password_length)
        [[ "$password" =~ [A-Z] ]] && [[ "$password" =~ [a-z] ]] && [[ "$password" =~ [0-9] ]] && [[ "$password" =~ [\!@#%_+\|:=] ]] &&
            {
                echo "$password"
                break
            }
    done
}

check_password_complexity() {
    local password=$1
    local rc=1
    local err_level=2
    local msg="Invalid password"

    if ((${#password} < $password_length)); then
        msg="Password needs to be at least $password_length characters"
    elif ! [[ $password =~ [A-Z] ]]; then
        msg="Password must include at least one uppercase letter"
    elif ! [[ $password =~ [a-z] ]]; then
        msg="Password must include at least one lowercase letter"
    elif ! [[ $password =~ [0-9] ]]; then
        msg="Password must include at least one number"
    elif ! [[ $password =~ [\!\@\#\$\%\^\&\*\(\)\_\+\{\}\|\:\<\>\?\=] ]]; then
        msg="Password must include at least one special character"
    elif [[ $password =~ [[:space:]] ]]; then
        msg="Password must not include any whitespace characters"
    else
        rc=0
        err_level=1
        msg="Password meets complexity requirements"
    fi

    logger $err_level "$msg"

    return $rc
}

mask_value() {
    local value=$1
    local mask_char=${2:-"*"}
    local mask_flag=${3:-0}
    local mask_len=${#value}

    if (($mask_flag == 1 && $mask_len > 4)); then
        mask_len=$(($mask_len - 4))
    elif (($mask_flag != 2)); then
        mask_len=0
    fi

    if (($mask_len == 0)); then
        echo "${value}"
    else
        echo "$(echo "${value}" | cut -c1-${mask_len} | sed -e "s/./${mask_char}/g")$(echo "${value}" | cut -c$((mask_len + 1))-)"
    fi
}

check_tool() {
    tool="$1"
    command="${2}"

    logger -1 "Checking ${tool}..."
    eval $command 2 >/dev/null 2>&1 || {
        logger 2 "${tool} not found"
        return 1
    }
    return 0
}

check_tools() {
    local rc=1
    logger 0 "Checking tools..."

    check_tool "jq -- JSON parser" 'jq --version' &&
        check_tool "python" 'python --version' &&
        check_tool "python3" 'python3 --version' &&
        check_tool "pip" 'pip --version' &&
        check_tool "pip3" 'pip3 --version' &&
        check_tool "npm" 'npm --version' &&
        check_tool "yarn" 'npm --version' &&
        check_tool "az -- Azure CLI" 'az --version'
    rc=$?

    if (($rc == 0)); then
        logger 1 "All tools are installed"
    else
        logger 2 "Some tools are missing"
    fi

    return $rc
}

logger 0 "${slug} started"

typeset here=$(dirname $(get_absolute_path $0))
typeset root_name="$(ls -a /.dockerenv >/dev/null 2>&1 && echo 'app' || echo 'foodvibes-ai')"
# Note: Do not use "git rev-parse --show-toplevel" as it is not available in Docker
typeset gitroot=$(echo "$here" | sed -e "s,${root_name}.*,${root_name},")
typeset env_file=$(get_absolute_path "${gitroot}/.env")
typeset env_file_ui=$(get_absolute_path "${gitroot}/ui/.env")
typeset subscription_id=""
typeset username=""
typeset resource_group_location=""
typeset resource_group_name=""
typeset entra_id_app_name=""
typeset key_vault_name=""
typeset database_server=""
typeset database_name="foodvibes_db"
typeset blob_storage_acct=""
typeset blob_container_name="foodvibes-blobcntr" # No underscores allowed
typeset adma_base_url=""
typeset adma_party_id=""
typeset adma_authority=""
typeset adma_client_id=""
typeset adma_client_secret=""
typeset farmvibes_url=""
typeset bingmaps_api_key=""
typeset foodvibes_app_insights_instrumentation_key=""
typeset database_username=""
typeset database_password=""

if (($fast_track == 1)); then
    rc=0
else
    [[ -f /home/vscode/.bashrc ]] &&
        {
            . /home/vscode/.bashrc
        }
    if (($main_script == 1)); then
        check_tools
        rc=$?
    else
        rc=0
    fi
    (($rc == 0)) && [[ -z "$(az account show)" ]] &&
        {
            az login
            rc=$?
        }
    (($rc == 0)) && {
        reset_env_files 0 $env_file $env_file_ui &&
            {
                (($main_script == 1)) && (($(get_value_boolean n "Reset all Azure config? (y/n)") == 1)) &&
                    {
                        typeset old_resource_group=$(get_env_file_entry RESOURCE_GROUP_NAME $env_file)

                        [[ -n "$old_resource_group" ]] && logger 1 "You may manually remove Resource Group \"$old_resource_group\" at your discretion"

                        remove_entra_id_spa_app "$(get_env_file_entry ENTRA_ID_APP_NAME $env_file)"
                        reset_env_files 1 $env_file $env_file_ui
                    }

                typeset update_all=$main_script
                resource_group_location=$(get_env_file_entry RESOURCE_GROUP_LOCATION $env_file)
                [[ -n "$resource_group_location" ]] && (($main_script == 1)) && (($(get_value_boolean n "Update all config entries? (y/n)") == 0)) && update_all=0

                typeset suffix=$(get_unique_id)

                get_set_file_entry RESOURCE_GROUP_LOCATION resource_group_location $env_file "West US" "Resource Group location" $update_all &&
                    get_set_file_entry RESOURCE_GROUP_NAME resource_group_name $env_file "foodvibes-rg-${suffix}" &&
                    get_set_file_entry ENTRA_ID_APP_NAME entra_id_app_name $env_file "fv-app-${suffix}" &&
                    get_set_file_entry KEY_VAULT_NAME key_vault_name $env_file $(truncate_unique_id "fv-kv-${suffix}") &&
                    get_set_file_entry DATABASE_SERVER database_server $env_file "fv-dbsrv-${suffix}" &&
                    get_set_file_entry BLOB_STORAGE_ACCT blob_storage_acct $env_file $(truncate_unique_id "fvssa${suffix}") &&
                    get_set_file_entry FARMVIBES_URL farmvibes_url $env_file "" "FarmVibes.ai URL" $update_all &&
                    get_set_file_entry BINGMAPS_API_KEY bingmaps_api_key $env_file "" "Bing Maps API Key" $update_all 1 &&
                    get_set_file_entry APP_INSIGHTS_INSTRUMENTATION_KEY foodvibes_app_insights_instrumentation_key $env_file "" "AppInsights instrumentation key" $update_all 1 &&
                    {
                        database_password=$(get_env_file_entry DATABASE_PASSWORD $env_file $(generate_password))
                        typeset token_based_db_access=0

                        (($update_all == 1)) && (($(get_value_boolean n "Use token-based database access? (y/n)") == 1)) && token_based_db_access=1

                        if (($token_based_db_access == 1)); then
                            rc=0
                        else
                            get_set_file_entry DATABASE_USERNAME database_username $env_file "myadminuser" "Database username" $update_all &&
                                [[ -n $database_username ]] &&
                                {
                                    typeset -i password_ok=0
                                    typeset update_password=$update_all

                                    while (($password_ok == 0)); do
                                        get_set_file_entry DATABASE_PASSWORD database_password $env_file "$database_password" \
                                            "Database password (min $password_length chars & at least include 1 upper, 1 lower, 1 number & 1 char from \"! @ # % _ + | : =\" set)" $update_password 2 &&
                                            check_password_complexity "$database_password" && password_ok=1 || update_password=1
                                    done

                                    [[ -n $database_password ]] && rc=$?
                                }
                        fi
                    }

                (($rc == 0 && $main_script == 1)) &&
                    check_if_key_vault_exists $key_vault_name 1 &&
                    logger 1 "Key Vault\n$(get_key_vault_secret_all $key_vault_name 1)"

                (($rc == 0)) &&
                    {
                        rc=1
                        get_set_file_entry ADMA_BASE_URL adma_base_url $env_file "" "ADMA base URL" $update_all &&
                            get_set_file_entry ADMA_PARTY_ID adma_party_id $env_file "" "ADMA party ID (the ID of client in ADMA)" $update_all &&
                            {
                                typeset adma_authority=$(get_env_file_entry ADMA_AUTHORITY $env_file)
                                typeset get_adma_credentials=0

                                [[ -z "$adma_authority" ]] && (($update_all == 1)) &&
                                    (($(get_value_boolean n "Use APP registration (not Entra ID) to connect to ADMA? (y/n)") == 1)) && get_adma_credentials=1

                                get_set_file_entry ADMA_AUTHORITY adma_authority $env_file "" "ADMA authority" $get_adma_credentials &&
                                    get_set_file_entry ADMA_CLIENT_ID adma_client_id $env_file "" "ADMA client ID (blank if using Azure Authentication to connect to ADMA)" $get_adma_credentials &&
                                    get_set_file_entry ADMA_CLIENT_SECRET adma_client_secret $env_file "" "ADMA client secret (blank if using Azure Authentication to connect to ADMA)" $get_adma_credentials

                            }
                    }
            }

        rc=$?
    }
    (($rc == 0)) && {
        az account show >/dev/null 2>&1 || az login
        rc=$?
    }
    (($rc == 0)) && {
        typeset az_show_account="$(az account show | jq '.id,.user.name' | sed -e 's/"//g')"

        subscription_id=$(echo "$az_show_account" | sed -n 1p)
        username=$(echo "$az_show_account" | sed -n 2p)

        [[ -z "$username" ]] &&
            {
                rc=1
                logger 2 "Username not found"
            }
    }
    (($rc == 0 && $main_script == 0)) &&
        logger 0 \
            "Current Configuration:\n" \
            "\nSubscription ID::::::::: ${subscription_id}" \
            "\nUsername:::::::::::::::: ${username}" \
            "\nResource Group Location: ${resource_group_location}" \
            "\nResource Group Name::::: ${resource_group_name}" \
            "\nEntra ID App Name::::::: ${entra_id_app_name}" \
            "\nKey Vault Name:::::::::: ${key_vault_name}" \
            "\nDatabase Server Name:::: ${database_server}" \
            "\nDatabase Instance Name:: ${database_name}" \
            "\nDatabase Username::::::: ${database_username}" \
            "\nDatabase Password::::::: $(mask_value "$database_password" "" 2)" \
            "\nBLOB Storage Account:::: ${blob_storage_acct}" \
            "\nBLOB Container Name::::: ${blob_container_name}" \
            "\nFarmVibes.ai URL:::::::: ${farmvibes_url}" \
            "\nBing Maps API Key::::::: $(mask_value "$bingmaps_api_key" "" 1)" \
            "\nAppInsights Instr. Key:: $(mask_value "$foodvibes_app_insights_instrumentation_key" "" 1)" \
            "\nADMA Base URL::::::::::: ${adma_base_url}" \
            "\nADMA Party ID::::::::::: ${adma_party_id}" \
            "\nADMA Authority:::::::::: $(mask_value "$adma_authority" "" 1)" \
            "\nADMA Client ID:::::::::: ${adma_client_id}" \
            "\nADMA Secret::::::::::::: $(mask_value "$adma_client_secret" "" 2)"
fi
