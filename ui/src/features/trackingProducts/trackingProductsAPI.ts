import {
    ComposeHttpHeaders,
    ComposeUrl,
    ComposeUrlGeo,
    HaveError as HasError,
} from "@foodvibes/utils/commonFunctions";
import {
    CommonCoordinates,
    ForestMapRequestType,
    QueryParamsType,
    QueryResponseApiType,
    TrackingProductsPutType,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import axios from "axios";

const composeUrl = (queryParams: QueryParamsType): string =>
    ComposeUrl("tracking_products", queryParams);

export const getTrackingProductsRows = async (queryParams: QueryParamsType, accessToken: string | null) =>
    await axios.get(composeUrl(queryParams), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data as QueryResponseApiType<TrackingProductsType>;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const putTrackingProducts = async (
    queryParams: QueryParamsType,
    dataNew: TrackingProductsPutType,
    accessToken: string | null,
) =>
    await axios.put(composeUrl(queryParams), dataNew, ComposeHttpHeaders(accessToken)).then(res => {
        const results: QueryResponseApiType<TrackingProductsType> = res.data;

        if (HasError(results.error)) {
            throw results.error;
        }

        return results;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const getAdma = async (id: string, coordinates: CommonCoordinates, accessToken: string | null) =>
    // No await to improve response time
    axios.get(ComposeUrlGeo("adma", id, coordinates), ComposeHttpHeaders(accessToken)).then(res => {
        return res.data;
        // Ignore .catch() here to allow slice rejected() handle errors
    });

export const postForestMap = async (forestMapRequest: ForestMapRequestType, accessToken: string | null) =>
    // No await to improve response time
    axios
        .post(ComposeUrlGeo("forest_map", forestMapRequest.id), {
            id: forestMapRequest.id,
            forest_year: forestMapRequest.forestYear,
            contour: forestMapRequest.contour,
            color: forestMapRequest.color,
            geojson: forestMapRequest.geojson,
        }, ComposeHttpHeaders(accessToken))
        .then(res => {
            return res.data;
            // Ignore .catch() here to allow slice rejected() handle errors
        });
