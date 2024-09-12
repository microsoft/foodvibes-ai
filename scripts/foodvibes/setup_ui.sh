typeset slug="UI setup"

. $(cd ${0%$(basename $0)} && pwd)/common.sh "${1}" "${2}" 0 "$slug"

((rc == 0)) && cd ${gitroot}/ui && yarn install

check_status $rc "${slug}"
