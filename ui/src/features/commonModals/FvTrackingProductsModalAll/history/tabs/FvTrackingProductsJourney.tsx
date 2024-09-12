import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
} from "@mui/material";

import iconTrackingProducts from "@foodvibes/assets/tracking-products.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLabelTrackingProducts } from "@foodvibes/utils/commonConstants";
import {
    ComposeIdKey,
} from "@foodvibes/utils/commonFunctions";
import { SubTitle } from "@foodvibes/utils/commonStyles";
import type {
    CommonCallBack,
    TrackingProductsMapType,
    TrackingProductsType
} from "@foodvibes/utils/commonTypes";
import {
    CommonDetailLevel,
} from "@foodvibes/utils/commonTypes";
import { useEffect, useMemo, useRef } from "react";
import FvTrackingProductsLedger from "./FvTrackingProductsLedger";

const getLedgerModalLabel = (
    idx: number,
    journeyData: TrackingProductsMapType[],
): string => {
    const flds: string[] = [];

    if (idx > -1 && idx < journeyData?.length) {
        const data: TrackingProductsMapType = journeyData[idx];
        const haveMultipleEntries: boolean = data.trackingProductsRankBeg !== data.trackingProductsRankEnd;

        flds.push("Location");
        flds.push((idx + 1).toString());
        flds.push("of");
        flds.push(journeyData.length.toString());
        flds.push("&");
        flds.push(`Ledger ${haveMultipleEntries ? "Entries" : "Entry"}`);
        flds.push(data.trackingProductsRankBeg.toString());

        if (haveMultipleEntries) {
            flds.push("-");
            flds.push(data.trackingProductsRankEnd.toString());
        }

        flds.push("of");
        flds.push(
            journeyData[
                journeyData.length - 1
            ].trackingProductsRankEnd.toString(),
        );
    }

    return flds.join(" ");
};

export default function FvTrackingProductsJourney({
    data, // data is in descending order of tracking_products_tx_id value
    journeyData,
    legendState,
    setLegendState,
    opacityPercent,
    deforestationAbovePct,
    isPickerOpenLedger,
    pickerOpenLedger,
    detailLevelA,
    setDetailLevelA,
    detailLevelB,
    setDetailLevelB,
    mapsEngineIsReady,
    centerCount,
    centerCycle,
    setCenterCycle,
    centerIdx,
    setCenterIdx,
    setCurrMapMovementIdx,
    currMapMovementIdx,
    latestRow,
    mapContainerM,
    bannerHeight,
}: {
    data: TrackingProductsType[];
    journeyData: TrackingProductsMapType[];
    legendState: boolean;
    setLegendState: (legendState: boolean) => void;
    opacityPercent: number;
    deforestationAbovePct: number;
    isPickerOpenLedger: boolean;
    pickerOpenLedger: (payload: boolean) => void;
    detailLevelA: CommonDetailLevel;
    setDetailLevelA: (detailLevel: CommonDetailLevel) => void;
    detailLevelB: CommonDetailLevel;
    setDetailLevelB: (detailLevel: CommonDetailLevel) => void;
    mapsEngineIsReady: boolean | null;
    centerCount: number;
    centerCycle: boolean;
    setCenterCycle: (on: boolean) => void;
    centerIdx: number;
    setCenterIdx: (idx: number) => void;
    setCurrMapMovementIdx: React.Dispatch<React.SetStateAction<number>>;
    currMapMovementIdx: number;
    latestRow: TrackingProductsMapType | null;
    mapContainerM: React.MutableRefObject<null> | null;
    bannerHeight: number;
}) {
    if (!data?.length) {
        return;
    }

    const closeDialog = () => {
        setCenterCycle(false);
        pickerOpenLedger(false);
        setCurrMapMovementIdx(-1);
    };

    const javascriptPipe = useRef(null);
    const observer = useMemo(() => new MutationObserver(function (mutationsList, observer) {
        const idxPiped: number = Number((mutationsList?.[0].target as HTMLElement).innerText);

        if (idxPiped > 0) {
            console.log('setCurrMapMovementIdx(idxPiped)', idxPiped - 1);
            setCurrMapMovementIdx(idxPiped - 1);
        }

    }), []);
    useEffect(() => {
        if (!observer || !javascriptPipe?.current) {
            return;
        }

        observer.observe(javascriptPipe.current, { characterData: false, childList: true, attributes: false });
    }, [javascriptPipe?.current]);

    return FvCardCommon({
        iconToUse: iconTrackingProducts,
        idToUse: "",
        tag: KLabelTrackingProducts,
        title: ComposeIdKey(
            latestRow?.tracking_products_ledger_id,
            latestRow?.tracking_products_tx_id,
        ),
        operationName: latestRow?.operation_name,
        isWide: true,
        noRibbon: data ? false : true,
        detailLevel: detailLevelA,
        setDetailLevel: setDetailLevelA,
        centerCount,
        centerCycle,
        centerIdx,
        setCenterCycle,
        setCenterIdx,
        legendState,
        setLegendState,
        opacityPercent,
        deforestationAbovePct,
        contentCb: (payload: CommonCallBack) => (
            <>
                <div id="javascriptPipe" ref={javascriptPipe} style={{ position: "absolute", top: 0, left: 0, display: "none", }} />
                <Box
                    sx={{
                        height: `calc(100vh - ${bannerHeight}px)`,
                        overflow: "auto",
                    }}
                >
                    <Dialog
                        fullWidth
                        maxWidth="xs"
                        open={isPickerOpenLedger}
                        onClose={closeDialog}
                    >
                        <DialogTitle>
                            <Box sx={{}}>
                                <Box component="span" sx={{
                                    "font-size": "22px",
                                    "background-color": "#555555",
                                    "border-radius": "4px 12px 0 0",
                                    "padding": "4px 0",
                                    "height": "24px",
                                    "width": "26px",
                                }}>&#x1F4DD;</Box>
                                <SubTitle>
                                    {getLedgerModalLabel(currMapMovementIdx, journeyData)}
                                </SubTitle>
                            </Box>
                        </DialogTitle>
                        <DialogContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            <FvTrackingProductsLedger
                                data={data}
                                trackingProductsRankToView={
                                    currMapMovementIdx > -1
                                        ? journeyData[currMapMovementIdx]
                                            .rank_curr_ledger_id
                                        : data.length
                                }
                                isModal
                                detailLevel={detailLevelB}
                                setDetailLevel={setDetailLevelB}
                                mapsEngineIsReady={mapsEngineIsReady}
                                isAutoHeight={false}
                                bannerHeight={bannerHeight}
                            />
                        </DialogContent>
                        <DialogActions>
                            <IconButton
                                aria-label={`Close ledger`}
                                onClick={closeDialog}
                                size={"small"}
                                color={"primary"}
                            >
                                Close
                            </IconButton>
                        </DialogActions>
                    </Dialog>
                    <Grid
                        item
                        md={5}
                        xs={12}
                        style={{
                            padding: "0",
                            margin: "0",
                            minWidth: "calc(100vw - 524px)",
                            minHeight: "calc(100vh - 360px)",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#acc7f2",
                        }}
                        ref={mapContainerM}
                    >
                        Microsoft Maps Loading...
                    </Grid>
                </Box>
            </>
        ),
    });
}
