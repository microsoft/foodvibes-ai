import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    ISbsFactPutType,
    ISbsFactType,
    ISbsSessionType,
    QueryParamsType,
    QueryResponseApiType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

export const sbsSessionsGet = async (queryParams: QueryParamsType) =>
    await axios.get(ComposeUrl("sbs_sessions_get", queryParams), ComposeHttpHeaders()).then(res => {
        return res.data as QueryResponseApiType<ISbsSessionType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const sbsFactGet = async (queryParams: QueryParamsType) =>
    await axios.get(ComposeUrl("sbs_fact", queryParams), ComposeHttpHeaders()).then(res => {
        return res.data as QueryResponseApiType<ISbsFactType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const sbsFactPatch = async (
    queryParams: QueryParamsType,
    dataNew: ISbsFactPutType,
) =>
    await axios.patch(ComposeUrl("sbs_fact", queryParams), dataNew, ComposeHttpHeaders()).then(res => {
        const results: QueryResponseApiType<ISbsFactType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
