import { KLedgerTypeScUser } from "@foodvibes/utils/commonConstants";
import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    QueryParamsType,
    QueryResponseApiType,
    ScUserPutType,
    ScUserType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

const composeUrl = (queryParams: QueryParamsType): string =>
    ComposeUrl(KLedgerTypeScUser, queryParams);

export const getScUserRows = async (queryParams: QueryParamsType, accessToken: string | null) =>
    await axios.get(composeUrl(queryParams), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data as QueryResponseApiType<ScUserType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putScUser = async (
    queryParams: QueryParamsType,
    dataNew: ScUserPutType,
    accessToken: string | null,
) =>
    await axios.put(composeUrl(queryParams), dataNew, ComposeHttpHeaders(accessToken)).then(res => {
        const results: QueryResponseApiType<ScUserType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
