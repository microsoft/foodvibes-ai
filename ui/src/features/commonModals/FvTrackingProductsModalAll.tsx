import { useMsal } from "@azure/msal-react";
import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionSetActiveCardType,
    actionSetBannerHeight,
    actionSetEditorOpen,
    actionSetModalOpenTrackingProductsHistory,
    actionSetPickerOpen,
    actionSetPickerOpenLedger,
    selectAccessToken,
    selectActiveCardType,
    selectAssumedAccessMask,
    selectBannerHeight,
    selectBookmarkedGeotrack,
    selectBookmarkedProduct,
    selectBookmarkedTrackingProducts,
    selectEditorOpen,
    selectMapsEngineIsReady,
    selectModalOpenTrackingProductsHistory,
    selectPickerOpen,
    selectPickerOpenLedger
} from "@foodvibes/app/mainSlice";
import {
    actionSetDetailLevelA,
    actionSetDetailLevelB,
    actionSetLastId,
    selectDetailLevelA,
    selectDetailLevelB
} from "@foodvibes/features/product/productSlice";
import {
    actionFetchForestMap,
    actionGetAdma,
    actionSetCenterCount,
    actionSetCenterCycle,
    actionSetCenterIdx,
    actionSetDeforestationAbovePct,
    actionSetForestMapState,
    actionSetGraphCompactMode,
    actionSetGraphDirection,
    actionSetHistoryTabIndex,
    actionSetLegendState,
    actionSetOpacityPercent,
    actionSetZoomPercent,
    selectCenterCount,
    selectCenterCycle,
    selectCenterIdx,
    selectDeforestationAbovePct,
    selectForestMapRequestDict,
    selectGraphCompactMode,
    selectGraphDirection,
    selectHistoryTabIndex,
    selectLegendState,
    selectOpacityPercent,
    selectTrackingProductsResponse,
    selectZoomPercent
} from "@foodvibes/features/trackingProducts/trackingProductsSlice";
import type {
    ApiStatusType,
    CommonCardType,
    CommonCoordinates,
    CommonDetailLevel,
    EditFieldsType,
    ForestMapRequestType,
    GeotrackType,
    ProductType,
    QueryResponseType,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import { FvCommonModalPicker } from "./FvCommonModalPicker";
import { FvTrackingProductsModalEdit } from "./FvTrackingProductsModalAll/FvTrackingProductsModalEdit";
import { FvTrackingProductsModalHistory } from "./FvTrackingProductsModalAll/FvTrackingProductsModalHistory";

export const FvTrackingProductsModalAll = ({
    isClean = true,
    reportTrackingProducts = () => { },
    upsertTrackingProducts = () => { },
    editFields = null,
    setEditFields = () => { },
}: {
    isClean?: boolean;
    reportTrackingProducts?: (row: TrackingProductsType | null, ledgerId?: number) => void;
    upsertTrackingProducts?: (keepEditorOpenNew: boolean, saveAsNew?: boolean) => void;
    editFields?: EditFieldsType | null;
    setEditFields?: (payload: EditFieldsType | null) => void;
}) => {
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const bookmarkedGeotrack: GeotrackType | null = useAppSelector(selectBookmarkedGeotrack,);
    const bookmarkedProduct: ProductType | null = useAppSelector(selectBookmarkedProduct,);
    const bookmarkedTrackingProducts: TrackingProductsType | null = useAppSelector(selectBookmarkedTrackingProducts);
    const centerIdx: number = useAppSelector(selectCenterIdx);
    const centerCount: number | null = useAppSelector(selectCenterCount);
    const centerCycle: boolean | null = useAppSelector(selectCenterCycle);
    const currActiveCardType: CommonCardType | null = useAppSelector(selectActiveCardType);
    const detailLevelA: CommonDetailLevel = useAppSelector(selectDetailLevelA);
    const detailLevelB: CommonDetailLevel = useAppSelector(selectDetailLevelB);
    const forestMapRequestDict: { [id: string]: ForestMapRequestType } = useAppSelector(selectForestMapRequestDict);
    const graphCompactMode: boolean = useAppSelector(selectGraphCompactMode);
    const graphDirection: boolean = useAppSelector(selectGraphDirection);
    const isEditorOpen: boolean = useAppSelector(selectEditorOpen) ?? false;
    const isPickerOpen: boolean = useAppSelector(selectPickerOpen) ?? false;
    const isModalOpenTrackingProductsHistory: boolean = useAppSelector(selectModalOpenTrackingProductsHistory) ?? false;
    const isPickerOpenLedger: boolean = useAppSelector(selectPickerOpenLedger) ?? false;
    const historyTabIndex: number = useAppSelector(selectHistoryTabIndex);
    const legendState: boolean = useAppSelector(selectLegendState);
    const opacityPercent: number = useAppSelector(selectOpacityPercent);
    const deforestationAbovePct: number = useAppSelector(selectDeforestationAbovePct,);
    const mapsEngineIsReady: boolean | null = useAppSelector(selectMapsEngineIsReady,);
    const trackingProductsResponse: QueryResponseType<TrackingProductsType> = useAppSelector(selectTrackingProductsResponse);
    const zoomPercent: number = useAppSelector(selectZoomPercent);
    const bannerHeight: number = useAppSelector(selectBannerHeight);
    const setActiveCardType = (payload: CommonCardType) => dispatch(actionSetActiveCardType(payload));
    const setCenterIdx = (idx: number) => dispatch(actionSetCenterIdx(idx));
    const setCenterCount = (idx: number) => dispatch(actionSetCenterCount(idx));
    const setCenterCycle = (on: boolean) => dispatch(actionSetCenterCycle(on));
    const setDetailLevelA = (detailLevel: CommonDetailLevel) => dispatch(actionSetDetailLevelA(detailLevel));
    const setDetailLevelB = (detailLevel: CommonDetailLevel) => dispatch(actionSetDetailLevelB(detailLevel));
    const setGraphCompactMode = (graphCompactMode: boolean) => dispatch(actionSetGraphCompactMode(graphCompactMode));
    const setGraphDirection = (graphDirection: boolean) => dispatch(actionSetGraphDirection(graphDirection));
    const setLastId = (lastId: number) => dispatch(actionSetLastId(lastId));
    const setHistoryTabIndex = (historyTabIndex: number) => dispatch(actionSetHistoryTabIndex(historyTabIndex));
    const setLegendState = (legendState: boolean) => dispatch(actionSetLegendState(legendState));
    const setOpacityPercent = (opacityPercent: number) => dispatch(actionSetOpacityPercent(opacityPercent));
    const setDeforestationAbovePct = (deforestationAbovePct: number) => dispatch(actionSetDeforestationAbovePct(deforestationAbovePct));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen(payload));
    const setPickerOpen = (payload: boolean) => dispatch(actionSetPickerOpen(payload));
    const setModalOpenTrackingProductsHistory = (payload: boolean) => dispatch(actionSetModalOpenTrackingProductsHistory(payload));
    const setPickerOpenLedger = (payload: boolean) => dispatch(actionSetPickerOpenLedger(payload));
    const setZoomPercent = (zoomPercent: number) => dispatch(actionSetZoomPercent(zoomPercent));
    const setBannerHeight = (bannerHeight: number) => dispatch(actionSetBannerHeight(bannerHeight));

    const fetchAdma = async (
        ledgerId: string,
        coordinates: CommonCoordinates,
    ) => {
        await dispatch(actionGetAdma({ ledgerId, coordinates, accessToken, instance }));
    };
    const fetchForestMap = async (forestMapRequest: ForestMapRequestType) => {
        await dispatch(actionFetchForestMap({ forestMapRequest, accessToken, instance }));
    };
    const setForestMapState = async (
        ledgerId: string,
        status: ApiStatusType,
    ) => {
        dispatch(actionSetForestMapState({ ledgerId, ...status }));
    };

    return (
        <>
            <FvTrackingProductsModalEdit
                bookmarkedGeotrack={bookmarkedGeotrack}
                bookmarkedProduct={bookmarkedProduct}
                isClean={isClean}
                data={trackingProductsResponse.reportData ?? []}
                detailLevelB={detailLevelB}
                editFields={editFields}
                isEditorOpen={isEditorOpen}
                mapsEngineIsReady={mapsEngineIsReady}
                setActiveCardType={setActiveCardType}
                setDetailLevelB={setDetailLevelB}
                setEditFields={setEditFields}
                setEditorOpen={setEditorOpen}
                setPickerOpen={setPickerOpen}
                report={reportTrackingProducts}
                upsert={upsertTrackingProducts}
                bannerHeight={bannerHeight}
            />

            <FvCommonModalPicker
                currActiveCardType={currActiveCardType}
                readOnly={true}
                isPickerOpen={isPickerOpen}
                setPickerOpen={setPickerOpen}
            />

            <FvTrackingProductsModalHistory
                bookmarkedTrackingProducts={bookmarkedTrackingProducts}
                centerCount={centerCount}
                centerCycle={centerCycle}
                centerIdx={centerIdx}
                deforestationAbovePct={deforestationAbovePct}
                detailLevelA={detailLevelA}
                detailLevelB={detailLevelB}
                fetchAdma={fetchAdma}
                fetchForestMap={fetchForestMap}
                forestMapRequestDict={forestMapRequestDict}
                graphCompactMode={graphCompactMode}
                graphDirection={graphDirection}
                isModalOpenTrackingProductsHistory={isModalOpenTrackingProductsHistory}
                isPickerOpenLedger={isPickerOpenLedger}
                historyTabIndex={historyTabIndex}
                legendState={legendState}
                mapsEngineIsReady={mapsEngineIsReady}
                opacityPercent={opacityPercent}
                setCenterCount={setCenterCount}
                setCenterCycle={setCenterCycle}
                setCenterIdx={setCenterIdx}
                setDeforestationAbovePct={setDeforestationAbovePct}
                setDetailLevelA={setDetailLevelA}
                setDetailLevelB={setDetailLevelB}
                setForestMapState={setForestMapState}
                setGraphCompactMode={setGraphCompactMode}
                setGraphDirection={setGraphDirection}
                setLastId={setLastId}
                setHistoryTabIndex={setHistoryTabIndex}
                setLegendState={setLegendState}
                setOpacityPercent={setOpacityPercent}
                setModalOpenTrackingProductsHistory={setModalOpenTrackingProductsHistory}
                setPickerOpenLedger={setPickerOpenLedger}
                trackingProductsResponse={trackingProductsResponse}
                zoomPercent={zoomPercent}
                setZoomPercent={setZoomPercent}
                bannerHeight={bannerHeight}
                setBannerHeight={setBannerHeight}
            />
        </>
    );
};
