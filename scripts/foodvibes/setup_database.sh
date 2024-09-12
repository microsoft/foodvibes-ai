typeset slug="Database setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 0 "$slug"

(($rc == 0)) &&
    check_if_key_vault_exists $key_vault_name &&
    {
        rc=1
        typeset secret_recs="$(get_key_vault_secret_all $key_vault_name)"
        typeset database_server="$(get_key_vault_secret database-server "" "$secret_recs" | cut -d'.' -f1)"
        typeset database_name="$(get_key_vault_secret database-name "" "$secret_recs")"
        typeset sql_username="$(get_key_vault_secret database-username "" "$secret_recs")"
        typeset sql_password="$(get_key_vault_secret database-password "" "$secret_recs")"

        # Check if the SQL Server exists
        serverExists=$(az sql server list --resource-group $resource_group_name --query "[?name=='$database_server'] | length(@)" 2>/dev/null)

        if [[ "${serverExists:-0}" != "0" ]]; then
            logger 1 "SQL Server \"$database_server\" exists in resource group \"$resource_group_name\""
            rc=0
        else
            logger 0 "Creating SQL Server \"$database_server\" in resource group \"$resource_group_name\"..."
            ((log_level < 0)) && set -xv
            az sql server create --name "$database_server" --resource-group "$resource_group_name" --location "$resource_group_location" --admin-user "$sql_username" --admin-password "$sql_password" >/dev/null
            rc=$?
            set +xv
        fi

        (($rc == 0)) &&
            database_check_if_exists "$resource_group_name" "$database_server" "$database_name" ||
            {
                logger 0 "Creating SQL Database \"$database_name\" on server \"$database_server\" in resource group \"$resource_group_name\"..."
                ((log_level < 0)) && set -xv
                az sql db create --resource-group $resource_group_name --server $database_server --name $database_name --service-objective S0 >/dev/null
                rc=$?
                set +xv
            }

        (($rc == 0)) &&
            database_update_firewall_rules "$resource_group_name" "$database_server" &&
            {
                typeset python_script=$(get_absolute_path "$here/generate_foodvibes_data.py")

                if [[ ! -f $python_script ]]; then
                    logger 2 "Python script $python_script not found"
                    rc=1
                else
                    logger 1 "Generating schema and sample data for FoodVibes..."

                    export $(grep KEY_VAULT_NAME ${env_file} | sed -e 's/"//g')
                    PYTHONPATH="$(dirname $(get_absolute_path "$gitroot/app.py"))" python $python_script True "$username"
                    rc=$?
                fi
            }
    }

check_status $rc "${slug}"
