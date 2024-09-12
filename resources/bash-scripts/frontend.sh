set -ex
/opt/miniconda/condabin/conda init bash

if [ "$ALLOW_SSH" = "true" ]; then
    /usr/sbin/sshd
    eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)
fi

cd /app/ui
source ~/.bashrc
conda activate foodvibes-all-in-one

rm -rf node_modules/

yarn install
yarn vite build
npm install -g serve

serve -s dist -l 3000