typeset slug_local="API setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 0 "$slug"

(($rc == 0)) && cd $gitroot &&
    {
        if [[ -f requirements.txt ]]; then
            pip install -r requirements.txt
            rc=$?
        else
            rc=0
        fi
    }

check_status $rc "${slug_local}"
