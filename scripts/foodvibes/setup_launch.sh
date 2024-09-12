typeset slug="Start the back-end and front-end services"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 0 "$slug"

(($rc == 0)) &&
    {
        rc=1
        typeset pid_be=0
        typeset pid_fe=0

        cd ${gitroot}

        logger 0 "Starting the back-end service..."

        PYTHONPATH="$(pwd)" python app.py &
        pid_be=$!

        if (($pid_be > 0)); then
            logger 0 "Starting the front-end service..."
            cd ui && yarn start
            pid_fe=$!

            if (($pid_fe > 0)); then
                logger 0 "Starting the front-end service..."
                # Function to send SIGQUIT to both tasks
                send_sigquit() {
                    logger 0 "Stopping the back-end and front-end services..."
                    kill -3 $pid_be
                    kill -3 $pid_fe
                    logger 1 "Stopped the back-end and front-end services."
                }

                # Trap SIGINT (Ctrl+C) to send SIGQUIT to both tasks
                trap 'send_sigquit' SIGINT

                rc=0

                logger 1 "The back-end and front-end services were started. Hit CTL-C to stop all services.\n"
                logger 0 "NOTE: Please ensure that ADMA and FarmVibes.ai services are running as FoodVibes needs to access these systems to fetch deforestation boundaries & images.\n"
                # Wait for both tasks to complete
                wait $pid_be
                wait $pid_fe
            fi
        else
            kill -9 $pid_be
        fi
    }

(($rc == 0)) || check_status $rc "${slug}"
