import { KLedgerTypeScGroup } from "@foodvibes/utils/commonConstants";
import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    QueryParamsType,
    QueryResponseApiType,
    ScGroupPutType,
    ScGroupType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

const composeUrl = (queryParams: QueryParamsType): string =>
    ComposeUrl(KLedgerTypeScGroup, queryParams);

export const getScGroupRows = async (queryParams: QueryParamsType, accessToken: string | null) =>
    await axios.get(composeUrl(queryParams), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data as QueryResponseApiType<ScGroupType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putScGroup = async (
    queryParams: QueryParamsType,
    dataNew: ScGroupPutType,
    accessToken: string | null,
) =>
    await axios.put(composeUrl(queryParams), dataNew, ComposeHttpHeaders(accessToken)).then(res => {
        const results: QueryResponseApiType<ScGroupType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
