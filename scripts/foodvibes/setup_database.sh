typeset slug="Database setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 0 "$slug"

(($rc == 0)) &&
    check_if_key_vault_exists $key_vault_name &&
    {
        rc=1
        typeset secret_recs="$(get_key_vault_secret_all $key_vault_name)"
        typeset sql_server_name="$(get_key_vault_secret database-server "" "$secret_recs" | cut -d'.' -f1)"
        typeset sql_database_name="$(get_key_vault_secret database-name "" "$secret_recs")"
        typeset sql_username="$(get_key_vault_secret database-username "" "$secret_recs")"
        typeset sql_password="$(get_key_vault_secret database-password "" "$secret_recs")"
        typeset iprecs="$(egrep "^DATABASE_IP_ADDR_START_|^DATABASE_IP_ADDR_END_" $env_file)"
        typeset ipreccnt=$(($(echo "$iprecs" | wc -l) / 2))

        # Check if the SQL Server exists
        serverExists=$(az sql server list --resource-group $resource_group_name --query "[?name=='$sql_server_name'] | length(@)" 2>/dev/null)

        if [[ "${serverExists:-0}" != "0" ]]; then
            logger 1 "SQL Server \"$sql_server_name\" exists in resource group \"$resource_group_name\""
            rc=0
        else
            logger 0 "Creating SQL Server \"$sql_server_name\" in resource group \"$resource_group_name\"..."
            ((log_level < 0)) && set -xv
            az sql server create --name "$sql_server_name" --resource-group "$resource_group_name" --location "$resource_group_location" --admin-user "$sql_username" --admin-password "$sql_password" >/dev/null
            rc=$?
            set +xv
        fi

        (($rc == 0)) &&
            {
                rc=1
                # Check if the SQL Database exists
                databaseExists=$(az sql db list --resource-group $resource_group_name --server $sql_server_name --query "[?name=='$sql_database_name'] | length(@)")

                if (($databaseExists == 1)); then
                    logger 1 "SQL Database \"$sql_database_name\" exists on server \"$sql_server_name\" in resource group \"$resource_group_name\""
                    rc=0
                else
                    logger 0 "Creating SQL Database \"$sql_database_name\" on server \"$sql_server_name\" in resource group \"$resource_group_name\"..."
                    ((log_level < 0)) && set -xv
                    az sql db create --resource-group $resource_group_name --server $sql_server_name --name $sql_database_name --service-objective S0 >/dev/null &&
                        {
                            set +xv
                            for ((ipidx = 0; ipidx < $ipreccnt; ipidx++)); do
                                sql_ip_addr_start="$(echo "$iprecs" | grep "^DATABASE_IP_ADDR_START_${ipidx}=" | sed -e "s/\"//g" | cut -d'=' -f2)"
                                sql_ip_addr_end="$(echo "$iprecs" | grep "^DATABASE_IP_ADDR_END_${ipidx}=" | sed -e "s/\"//g" | cut -d'=' -f2)"

                                [[ -z $sql_ip_addr_start || -z $sql_ip_addr_end ]] && {
                                    logger 2 "IP address range not found for index $ipidx"
                                    continue
                                }

                                logger 1 "Creating firewall rule for IP address range ${sql_ip_addr_start} - ${sql_ip_addr_end}..."

                                ((log_level < 0)) && set -xv
                                az sql server firewall-rule create --resource-group $resource_group_name --server $sql_server_name --name AllowYourIP${ipidx} --start-ip-address $sql_ip_addr_start --end-ip-address $sql_ip_addr_end
                                set +xv
                            done

                            rc=0
                        }
                    set +xv
                fi
            }

        (($rc == 0)) && {
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
