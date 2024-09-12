#!/usr/bin/bash

# Generate models from database schema
#
# 20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release
# 20240611 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Updated logic to use privately built sqlacodegen to use main
#                                                       app's singleton config class for database connection
#
# Courtesy https://github.com/ksindi/flask-sqlacodegen/tree/master

typeset -r here=$(dirname $0)
typeset -r model_file_dir=$(cd ${here}/.. && pwd)/api/common/
typeset -r model_file=${model_file_dir}/models.py
typeset -r model_file_tmp=${model_file}.tmp

[ ! -d "$model_file_dir" ] && mkdir $model_file_dir

log_msg() {
    echo "$(date +'%Y-%m-%dT%H:%M:%S%:z') $*" >&2
}

get_connection_string() {
    log_msg "Fetching databse connection string from Azure Key Vault..."

    az keyvault secret show --name foodvibes-connection-string --vault-name foodvibes-keyvault --query value | sed -e 's,",,g'
}

generate_raw_models() {
    # List of objects to extract from database to generate their python models
    typeset -a db_objs=(
        "foodvibes_constants"
        "foodvibes_geotrack"
        "foodvibes_product"
        "foodvibes_sc_group"
        "foodvibes_sc_user"
        "foodvibes_sc_circle"
        "foodvibes_tracking_products"
        "foodvibes_geotrack_ledger_view"
        "foodvibes_product_ledger_view"
        "foodvibes_tracking_products_ledger_view"
        "foodvibes_sc_group_ledger_view"
        "foodvibes_sc_user_ledger_view"
        "foodvibes_sc_circle_ledger_view"
    )
    typeset -r connection_string=$(get_connection_string)
    IFS=','

    log_msg "Extracting object definitions from database..."
    PYTHONPATH="${here}/.." python3 ${here}/sqlacodegen/main.py --tables "${db_objs[*]}" |
        sed -e 's/ orm_id = db.Column(db.Integer, nullable=False)/ orm_id = db.Column(db.Integer, primary_key=True, nullable=False)/' \
            -e 's/class FoodvibesTrackingProduct(/class FoodvibesTrackingProducts(/' \
            -e 's/class FoodvibesConstant(/class FoodvibesConstants(/' \
            -e "s/image_url = db.Column(db.String(1, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)/image_url = db.Column(db.Unicode(collation='SQL_Latin1_General_CP1_CI_AS'))/" \
            -e "s/_image_url = db.Column(db.String(1, 'SQL_Latin1_General_CP1_CI_AS'))/_image_url = db.Column(db.Unicode(collation='SQL_Latin1_General_CP1_CI_AS'))/" \
            >$model_file_tmp && {
        cat <<EOS
from typing import Any

from pydantic import BaseModel
from sqlalchemy import BigInteger, Boolean, Column, DateTime, FetchedValue, Float, Integer, String, Unicode
from sqlalchemy.orm import declarative_base

base = declarative_base()
EOS

        cat $model_file_tmp | sed -n '6,$p' | grep -v "^$" | sed -e 's/(db.Model):/(base):/' -e 's/db.//g'
    } >$model_file
}

postprocess_models() {
    recs="$(grep -n '^class ' $model_file | cut -d\( -f1 | sed -e 's/class //')"

    {
        typeset -ir totalClassCount=$(echo "$recs" | wc -l)
        typeset -i currClassIdx=0 nextClassIdx lineStart lineEnd
        typeset rec currClassName

        while ((currClassIdx < totalClassCount)); do
            currClassIdx=currClassIdx+1
            rec=$(echo "$recs" | sed -n "${currClassIdx}p")
            lineStart=$(echo $rec | cut -d: -f1)
            currClassName=$(echo $rec | cut -d: -f2)
            nextClassIdx=currClassIdx+1

            log_msg "Processing class ${currClassName}..."

            if ((nextClassIdx > totalClassCount)); then
                lineEnd=$(cat $model_file | wc -l)
            else
                rec=$(echo "$recs" | sed -n "${nextClassIdx}p")
                lineEnd=$(echo $rec | cut -d: -f1)
                lineEnd=lineEnd-1
            fi

            sed -n "${lineStart},${lineEnd}p" <$model_file | egrep -v "__tablename__|  orm_id:|^$" |
                sed -e "s/(base):/Response(BaseModel):/" \
                    -e "s/ = Column(Integer, primary_key=True, nullable=False)/: int/" \
                    -e "s/ = Column(Integer, primary_key=True, server_default=FetchedValue())/: int/" \
                    -e "s/ = Column(Integer, nullable=False)/: int/" \
                    -e "s/ = Column(BigInteger, nullable=False)/: int/" \
                    -e "s/ = Column(Integer, nullable=False, index=True)/: int/" \
                    -e "s/ = Column(BigInteger)/: int | None/" \
                    -e "s/ = Column(Unicode(collation='SQL_Latin1_General_CP1_CI_AS'), server_default=FetchedValue())/: str | None/" \
                    -e "s/ = Column(Unicode(collation='SQL_Latin1_General_CP1_CI_AS'), nullable=False, server_default=FetchedValue())/: str/" \
                    -e "s/ = Column(Unicode(64, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)/: str/" \
                    -e "s/ = Column(String(1, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)/: str/" \
                    -e "s/ = Column(String(1, 'SQL_Latin1_General_CP1_CI_AS'))/: str/" \
                    -e "s/ = Column(Unicode(collation='SQL_Latin1_General_CP1_CI_AS'), nullable=False)/: str/" \
                    -e "s/ = Column(Unicode(64, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False, index=True)/: str/" \
                    -e "s/ = Column(Integer, nullable=False)/: int/" \
                    -e "s/ = Column(Integer)/: int | None/" \
                    -e "s/ = Column(Integer, server_default=FetchedValue())/: int | None/" \
                    -e "s/ = Column(DateTime, server_default=FetchedValue())/: str | None/" \
                    -e "s/ = Column(DateTime, nullable=False, server_default=FetchedValue())/: str/" \
                    -e "s/ = Column(DateTime, nullable=False)/: str/" \
                    -e "s/ = Column(DateTime)/: str | None/" \
                    -e "s/ = Column(Unicode(collation='SQL_Latin1_General_CP1_CI_AS'))/: str | None/" \
                    -e "s/ = Column(Unicode(64, 'SQL_Latin1_General_CP1_CI_AS'))/: str | None/" \
                    -e "s/ = Column(Unicode(256, 'SQL_Latin1_General_CP1_CI_AS'))/: str | None/" \
                    -e "s/ = Column(Float(53))/: float | None/" \
                    -e "s/ = Column(Float(53), nullable=False)/: float/" \
                    -e "s/ = Column(Boolean)/: bool/"
        done
    } >$model_file_tmp && {
        cat $model_file_tmp
        cat $model_file_tmp | sed -e "s/Response(BaseModel):/Request(BaseModel):/" | egrep -v \
            ' operation_name:| ledger_start_transaction_id:| ledger_end_transaction_id:| ledger_start_sequence_number:| ledger_end_sequence_number:'
    } >>$model_file && mv $model_file $model_file_tmp && {
        sed -e 's/^class /\nclass /' <$model_file_tmp

        cat <<EOS

class FarmVibesForestRequest(BaseModel):
    id: str
    forest_year: int
    contour: bool
    color: str
    geojson: dict[str, Any]

EOS
    } >$model_file
}

log_msg "Generating models from SQL Server database..."

generate_raw_models $model_file $model_file_tmp &&
    postprocess_models $model_file $model_file_tmp

log_msg "Done with rc=$?.  Model file is ${model_file}."

rm -f $model_file_tmp
