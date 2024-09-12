set -ex

source ~/.bashrc
conda activate foodvibes-all-in-one

export OTEL_RESOURCE_ATTRIBUTES="service.name=foodvibes-backend"
python /app/app.py
