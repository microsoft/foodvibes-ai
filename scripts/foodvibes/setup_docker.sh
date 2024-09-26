typeset slug="Docker Setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" 0 1 "$slug"

typeset key_name_image="DOCKER_IMAGE"
typeset key_name_port_be="DOCKER_PORT_BE"
typeset key_name_port_fe="DOCKER_PORT_FE"
typeset image_name=$(get_env_file_entry $key_name_image $env_file)
typeset port_be=$(get_env_file_entry $key_name_port_be $env_file)
typeset port_fe=$(get_env_file_entry $key_name_port_fe $env_file)
typeset create_image=0
export DOCKER_CLI_HINTS=false

(($rc == 0)) && cd $gitroot &&
    {
        if [[ -z "$image_name" ]]; then
            image_name="fv-$(truncate_unique_id)"
            create_image=1
        else
            docker image list | grep $image_name >/dev/null 2>&1 || create_image=1
        fi

        (($create_image == 1)) &&
            {
                rc=1

                logger 0 "Creating new Docker image \"$image_name\"..."
                run_cmd docker build -t $image_name -f resources/docker/Dockerfile . &&
                    logger 1 "Created new Docker image \"$image_name\"" &&
                    set_env_file_entry $key_name_image $image_name $env_file &&
                    rc=0
            }

        (($rc == 0)) &&
            {
                rc=1

                logger 0 "Checking/starting Docker container for image \"$image_name\"..."

                typeset container_id=$(docker ps -a --filter "status=running" | grep $image_name | head -1 | cut -d' ' -f1)
                typeset container_exists=0
                typeset container_is_active=0
                typeset cmd="setup.sh"
                typeset msg="to complete FoodVibes.ai installation and startup"
                typeset docker_exec="docker exec"

                [[ "$(env | grep TERM_PROGRAM= | cut -d= -f2)" == "mintty" ]] &&
                    {
                        logger 0 "Found mintty, using winpty with \"${docker_exec}\"..."
                        docker_exec="winpty ${docker_exec}"
                    }

                if [[ -n "$container_id" ]]; then
                    container_exists=1
                    container_is_active=1
                else
                    container_id=$(docker ps -a --filter "status=exited" | grep $image_name | head -1 | cut -d' ' -f1)
                    [[ -n "$container_id" ]] && container_exists=1
                fi

                if (($container_is_active == 1)); then
                    logger 1 "Found running container \"$container_id\""
                    rc=0
                else
                    logger 0 "No containers are running"

                    if (($container_exists == 1)); then
                        logger 0 "Restarting exited container \"$container_id\"..."

                        run_cmd docker restart $container_id
                        rc=$?
                    else
                        logger 0 "Starting new container..."

                        port_be=$(get_value "7478" 0 "Backend port # to use")
                        port_fe=$(get_value "3000" 0 "Frontend port # to use")

                        set_env_file_entry $key_name_port_be $port_be $env_file &&
                            set_env_file_entry $key_name_port_fe $port_fe $env_file &&
                            run_cmd docker run --name "$image_name-$(truncate_unique_id)" --init --privileged -p ${port_fe}:3000 -p ${port_be}:7478 -d $image_name &&
                            {
                                rc=0
                                container_id=$(docker ps | grep $image_name | head -1 | cut -d' ' -f1)
                            }
                    fi

                    (($rc == 0)) && container_is_active=1
                fi

                (($rc == 0)) &&
                    {
                        eval $docker_exec -it $container_id bash -c \'grep RESOURCE_GROUP_NAME /app/.env \>/dev/null 2\>\&1\' &&
                            {
                                cmd="setup_launch.sh"
                                msg="to restart foodvibes-ai"
                            }

                        rc=1
                        logger 1 "Docker container is running. Run\n\n    $cmd\n\n$msg"
                        run_cmd_conditional_check 1 $docker_exec -it $container_id bash -c 'bash -l'
                        rc=$?
                    }
            }
    }

check_status $rc "${slug} setup"
