import { KLedgerTypeScCircle } from "@foodvibes/utils/commonConstants";
import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    QueryParamsType,
    QueryResponseApiType,
    ScCirclePutType,
    ScCircleType
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

const composeUrl = (queryParams: QueryParamsType): string =>
    ComposeUrl(KLedgerTypeScCircle, queryParams);

export const getScCircleRows = async (queryParams: QueryParamsType, accessToken: string | null) =>
    await axios.get(composeUrl(queryParams), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data as QueryResponseApiType<ScCircleType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putScCircle = async (
    queryParams: QueryParamsType,
    dataNew: ScCirclePutType,
    accessToken: string | null,
) =>
    await axios.put(composeUrl(queryParams), dataNew, ComposeHttpHeaders(accessToken)).then(res => {
        const results: QueryResponseApiType<ScCircleType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
