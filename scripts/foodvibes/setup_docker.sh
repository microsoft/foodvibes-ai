typeset slug="Docker Setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" 0 1 "$slug"

typeset key_name_image="DOCKER_IMAGE"
typeset key_name_port_be="DOCKER_PORT_BE"
typeset key_name_port_fe="DOCKER_PORT_FE"
typeset image_name=$(get_env_file_entry $key_name_image $env_file)
typeset port_be=$(get_env_file_entry $key_name_port_be $env_file)
typeset port_fe=$(get_env_file_entry $key_name_port_fe $env_file)
typeset create_image=0

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

                typeset container_id=$(docker ps | grep $image_name | cut -d' ' -f1)
                typeset cmd="setup.sh"
                typeset msg="to complete FoodVibes.ai installation and startup"
                typeset docker_exec="docker exec"

                [[ "$(env | grep TERM_PROGRAM= | cut -d= -f2)" == "mintty" ]] &&
                {
                    logger 0 "Found mintty, using winpty with \"${docker_exec}\"..."
                    docker_exec="winpty ${docker_exec}"
                }

                if [[ -z "$container_id" ]]; then
                    logger 0 "No containers are running. Starting container..."

                    port_be=$(get_value "7478" 0 "Backend port # to use")
                    port_fe=$(get_value "3000" 0 "Frontend port # to use")
                    set_env_file_entry $key_name_port_be $port_be $env_file &&
                        set_env_file_entry $key_name_port_fe $port_fe $env_file &&
                        run_cmd docker run --name "$image_name-$(truncate_unique_id)" --init --privileged -p ${port_fe}:3000 -p ${port_be}:7478 -d $image_name &&
                        {
                            rc=0
                            container_id=$(docker ps | grep $image_name | cut -d' ' -f1)
                        }
                else
                    logger 1 "Found running container \"$container_id\""
                    rc=0

                    [[ -n "$(eval $docker_exec -it $container_id bash -c 'grep RESOURCE_GROUP_NAME /app/.env 2>/dev/null')" ]] &&
                        {
                            cmd="setup_launch.sh"
                            msg="to restart foodvibes-ai"
                        }
                fi

                (($rc == 0)) &&
                    {
                        rc=1
                        logger 1 "Docker container is running. Run\n\n    $cmd\n\n$msg"
                        run_cmd_conditional_check 1 $docker_exec -it $container_id bash -c 'bash -l'
                        rc=$?
                    }
            }
    }

check_status $rc "${slug} setup"
