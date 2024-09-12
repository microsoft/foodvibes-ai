typeset slug="FarmVibes.ai for deforestation images setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 1 "$slug"

install_farmvibes_ai() {
    local rc=1
    logger 0 "Fetching source code and creating virtual environment..."

    cd $gitroot/.. &&
        logger 0 "Installation directory is \"$(pwd)\"..." &&
        {
            cd farmvibes-ai 2>/dev/null &&
                {
                    logger 1 "Found existing repo files"
                    rc=0
                } ||
                {
                    logger 0 "Cloning repo files..."
                    git clone https://github.com/microsoft/farmvibes-ai.git && cd farmvibes-ai && rc=0
                }
        }
    (($rc == 0)) &&
        {
            rc=1

            python -m venv .venv &&
                {
                    if [[ -f .venv/bin/activate ]]; then
                        . .venv/bin/activate && rc=0
                    elif [[ -f .venv/Scripts/activate ]]; then
                        . .venv/Scripts/activate && rc=0
                    else
                        logger 2 "Unable to set up virtual environment"
                    fi
                }

            (($rc == 0)) &&
                {
                    logger 1 "Virtual enviroment set up. Current directory is $(pwd)"
                    logger 1 "Installing FarmVibes.ai..."

                    bash ./resources/vm/setup_farmvibes_ai_vm.sh &&
                        pip install ./src/vibe_core &&
                        farmvibes-ai local setup && {
                        logger 1 "Validating FarmVibes.ai installation..."

                        python -m vibe_core.farmvibes_ai_hello_world &&
                            farmvibes-ai local status
                    } && {
                        logger 1 "Successful installation. FarmVibes.ai service is running."

                        cat <<EOS

To interact with farmvibes-ai, enter the virtual environment using:
    cd farmvibes-ai
    . .venv/bin/activate

To stop service
    farmvibes-ai local stop

To start service
    farmvibes-ai local start

To view service status
    farmvibes-ai local status

To exit virtual environment
    deactivate
    cd ~-
EOS
                    } ||
                        logger 2 "Failed installation"
                }
        }
}

install_farmvibes_ai
rc=$?

check_status $rc "${slug}"
