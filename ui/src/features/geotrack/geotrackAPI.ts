import { KLedgerTypeGeotrack } from "@foodvibes/utils/commonConstants";
import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    GeotrackPutType,
    GeotrackType,
    QueryParamsType,
    QueryResponseApiType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

const composeUrl = (queryParams: QueryParamsType): string =>
    ComposeUrl(KLedgerTypeGeotrack, queryParams);

export const getGeotrackRows = async (queryParams: QueryParamsType, accessToken: string | null) =>
    await axios.get(composeUrl(queryParams), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data as QueryResponseApiType<GeotrackType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putGeotrack = async (
    queryParams: QueryParamsType,
    dataNew: GeotrackPutType,
    accessToken: string | null
) =>
    await axios.put(composeUrl(queryParams), dataNew, ComposeHttpHeaders(accessToken)).then(res => {
        const results: QueryResponseApiType<GeotrackType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
