import { KLedgerTypeProduct } from "@foodvibes/utils/commonConstants";
import { ComposeHttpHeaders, ComposeUrl, HaveError } from "@foodvibes/utils/commonFunctions";
import {
    ProductPutType,
    ProductType,
    QueryParamsType,
    QueryResponseApiType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

const composeUrl = (queryParams: QueryParamsType): string =>
    ComposeUrl(KLedgerTypeProduct, queryParams);

export const getProductRows = async (queryParams: QueryParamsType, accessToken: string | null) =>
    await axios.get(composeUrl(queryParams), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data as QueryResponseApiType<ProductType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putProduct = async (
    queryParams: QueryParamsType,
    dataNew: ProductPutType,
    accessToken: string | null,
) =>
    await axios.put(composeUrl(queryParams), dataNew, ComposeHttpHeaders(accessToken)).then(res => {
        const results: QueryResponseApiType<ProductType> = res.data;

        if (HaveError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });
