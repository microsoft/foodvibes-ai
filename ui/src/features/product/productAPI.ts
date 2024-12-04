import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    ISbsFactPutType,
    ISbsFactType,
    QueryParamsType,
    QueryResponseApiType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

export const getProductRows = async (queryParams: QueryParamsType) =>
    await axios.get(ComposeUrl("sbs_document", queryParams), ComposeHttpHeaders()).then(res => {
        return res.data as QueryResponseApiType<ISbsFactType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putProduct = async (
    queryParams: QueryParamsType,
    dataNew: ISbsFactPutType,
) =>
    await axios.put(ComposeUrl(`sbs_fact/${dataNew.id}`, queryParams), dataNew, ComposeHttpHeaders()).then(res => {
        const results: QueryResponseApiType<ISbsFactType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
