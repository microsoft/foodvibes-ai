set -ex

# /opt/miniconda/condabin/conda run -n foodvibes-all-in-one python /app/app.py&
/usr/sbin/sshd
eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)

/opt/miniconda/bin/conda init bash
source ~/.bashrc

/usr/sbin/nginx -g "daemon off;"