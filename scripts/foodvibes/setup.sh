typeset slug="FoodVibes"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" 1 0 "$slug"

check_run_module() {
    local here=$1
    local tag=$2
    local modname=$3
    local run_module=$4
    local love_level=$5
    local rc=1

    (($run_module == 0)) && (($(get_value_boolean n "${tag}? (y/n)") == 1)) && run_module=1
    if (($run_module == 1)); then
        $here/setup_${modname}.sh $log_level
        rc=$?
    else
        logger 0 "Skipped ${tag}"
        rc=0
    fi

    return $rc
}

typeset operation=""
typeset run_all=0
typeset run_module=0

((rc == 0 && $(get_value_boolean n "Install/update ALL? (y/n)") == 1)) && run_all=1
((rc == 0)) &&
    {
        check_run_module $here "Install/update Key Vault" "key_vault" $run_all $log_level &&
            check_run_module $here "Install/update API" "api" $run_all $log_level &&
            check_run_module $here "Install/update UI" "ui" $run_all $log_level &&
            check_run_module $here "Install/update Database" "database" $run_all $log_level &&
            check_run_module $here "Start the back-end and front-end services" "launch" $run_all $log_level
        rc=$?
    }

check_status $rc "${slug} setup"
