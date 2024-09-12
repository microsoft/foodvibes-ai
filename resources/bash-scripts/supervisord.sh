/opt/miniconda/bin/conda init bash
source ~/.bashrc

conda activate foodvibes-all-in-one
supervisord -c /etc/supervisor/conf.d/supervisord.conf