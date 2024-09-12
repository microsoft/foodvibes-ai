import mapLegend from "@foodvibes/assets/map-legend.png";
import { KBannerHeightMin } from "@foodvibes/utils/commonConstants";
import {
    IconButtonNonSave,
    StyledCardSubtitleTall,
    StyledHistoryPoints,
    StyledHistoryPointsSubtitle,
    StyledSliderLabel,
    SubTitle
} from "@foodvibes/utils/commonStyles";
import {
    ApiStatusType,
    CommonCoordinates,
    CommonDetailLevel,
    ForestMapRequestType,
    QueryResponseType,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Slider
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import FvTrackingProductsHistory from "./history/FvTrackingProductsHistory";

const fontSizeMax = 0.8;
const rangeMin = 0;
const rangeMax = 100;
const rangeInc = 5;
const rangeInc2 = 1;
const valuetext = (value: number): string => `${value}%`;
export const FvTrackingProductsModalHistory = ({
    bookmarkedTrackingProducts,
    centerCount,
    centerCycle,
    centerIdx,
    deforestationAbovePct,
    detailLevelA,
    detailLevelB,
    fetchAdma,
    fetchForestMap,
    forestMapRequestDict,
    graphCompactMode,
    graphDirection,
    isModalOpenTrackingProductsHistory,
    isPickerOpenLedger,
    historyTabIndex,
    legendState,
    mapsEngineIsReady,
    opacityPercent,
    setCenterCount,
    setCenterCycle,
    setCenterIdx,
    setDeforestationAbovePct,
    setDetailLevelA,
    setDetailLevelB,
    setForestMapState,
    setGraphCompactMode,
    setGraphDirection,
    setLastId,
    setHistoryTabIndex,
    setLegendState,
    setOpacityPercent,
    setModalOpenTrackingProductsHistory,
    setPickerOpenLedger,
    trackingProductsResponse,
    zoomPercent,
    setZoomPercent,
    bannerHeight,
    setBannerHeight,
}: {
    bookmarkedTrackingProducts: TrackingProductsType | null;
    centerCount: number;
    centerCycle: boolean;
    centerIdx: number;
    deforestationAbovePct: number;
    detailLevelA: CommonDetailLevel;
    detailLevelB: CommonDetailLevel;
    fetchAdma: (ledgerId: string, coordinates: CommonCoordinates) => void;
    fetchForestMap: (forestMapRequest: ForestMapRequestType) => void;
    forestMapRequestDict: { [id: string]: ForestMapRequestType };
    graphCompactMode: boolean;
    graphDirection: boolean;
    isModalOpenTrackingProductsHistory: boolean;
    isPickerOpenLedger: boolean;
    historyTabIndex: number;
    legendState: boolean;
    mapsEngineIsReady: boolean | null;
    opacityPercent: number;
    setCenterCount: (idx: number) => void;
    setCenterCycle: (on: boolean) => void;
    setCenterIdx: (idx: number) => void;
    setDeforestationAbovePct: (deforestationAbovePct: number) => void;
    setDetailLevelA: (detailLevel: CommonDetailLevel) => void;
    setDetailLevelB: (detailLevel: CommonDetailLevel) => void;
    setForestMapState: (ledgerId: string, status: ApiStatusType) => void;
    setGraphCompactMode: (compactMode: boolean) => void;
    setGraphDirection: (direction: boolean) => void;
    setLastId: (lastId: number) => void;
    setHistoryTabIndex: (idx: number) => void;
    setLegendState: (legendState: boolean) => void;
    setOpacityPercent: (opacityPercent: number) => void;
    setModalOpenTrackingProductsHistory: (payload: boolean) => void;
    setPickerOpenLedger: (payload: boolean) => void;
    trackingProductsResponse: QueryResponseType<TrackingProductsType>;
    zoomPercent: number;
    setZoomPercent: (zoomPercent: number) => void;
    bannerHeight: number;
    setBannerHeight: (bannerHeight: number) => void;
}) => {
    const productBannerFrom: string = trackingProductsResponse?.reportData?.[trackingProductsResponse.reportData.length - 1]?.product_id ?? "--";
    const productBannerTo: string = trackingProductsResponse?.reportData?.[0]?.geotrack_id ?? "--";
    const controlLeftRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const controlRightRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const [fontSize, setFontSize] = useState<number>(fontSizeMax);
    const onResize = useCallback(() => {
        if (controlLeftRef?.current && controlRightRef?.current) {
            const dimensionsLeft = (controlLeftRef.current as HTMLElement).getBoundingClientRect();
            const dimensionsRight = (controlRightRef.current as HTMLElement).getBoundingClientRect();
            const bannerDelta = dimensionsRight.top - dimensionsLeft.top;
            const bannerHeightNew = KBannerHeightMin + bannerDelta;
            const fontSizeNew = bannerDelta > 29 ? fontSizeMax * 0.6 : fontSizeMax;

            console.warn(`Banner: leftXY=${dimensionsLeft.left},${dimensionsLeft.top} & rightXY=${dimensionsRight.left},${dimensionsRight.top}`);
            setBannerHeight(bannerHeightNew);
            setFontSize(fontSizeNew);
        }
    }, [bannerHeight, fontSize]);
    useEffect(() => {
        window.addEventListener("resize", onResize);
        onResize();
        return () => {
            if (controlLeftRef?.current && controlRightRef?.current) {
                window.removeEventListener("resize", onResize);
            }
        };
    }, []);

    return (
        <Dialog
            fullWidth
            maxWidth="xl"
            open={isModalOpenTrackingProductsHistory}
            onClose={() => {
                setCenterCycle(false);
                setLastId(0);
                setModalOpenTrackingProductsHistory(false);
            }}
            sx={{
                minHeight: "calc(100vh - 0px)",
                maxHeight: "calc(100vh - 0px)",
            }}
        >
            <DialogTitle sx={{
                maxHeight: `${bannerHeight}px`,
                minHeight: `${bannerHeight}px`,
            }}>
                <SubTitle>
                    <Grid component="span" container spacing={0}>
                        <Grid component="span" item xs>
                            <StyledHistoryPoints ref={controlLeftRef} sx={{
                                fontSize: `${fontSize}rem`,
                            }}>
                                {productBannerFrom}
                            </StyledHistoryPoints>
                            &rarr;
                        </Grid>
                        <Grid component="span" item xs>
                            <StyledHistoryPoints ref={controlRightRef} sx={{
                                fontSize: `${fontSize}rem`,
                            }}>{productBannerTo}</StyledHistoryPoints>
                        </Grid>
                        <Grid component="span" item xs={12}>
                            <StyledHistoryPointsSubtitle>
                                History{" "}
                                {
                                    bookmarkedTrackingProducts?.tracking_products_ledger_id
                                }
                            </StyledHistoryPointsSubtitle>
                        </Grid>
                    </Grid>
                </SubTitle>
            </DialogTitle>
            <DialogContent
                sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
                <FvTrackingProductsHistory
                    data={trackingProductsResponse.reportData ?? []}
                    forestMapRequestDict={forestMapRequestDict}
                    fetchAdma={fetchAdma}
                    fetchForestMap={fetchForestMap}
                    setForestMapState={setForestMapState}
                    graphCompactMode={graphCompactMode}
                    setGraphCompactMode={setGraphCompactMode}
                    graphDirection={graphDirection}
                    setGraphDirection={setGraphDirection}
                    historyTabIndex={historyTabIndex}
                    setHistoryTabIndex={setHistoryTabIndex}
                    legendState={legendState}
                    setLegendState={setLegendState}
                    opacityPercent={opacityPercent}
                    deforestationAbovePct={deforestationAbovePct}
                    isPickerOpenLedger={isPickerOpenLedger}
                    pickerOpenLedger={setPickerOpenLedger}
                    detailLevelA={detailLevelA}
                    detailLevelB={detailLevelB}
                    setDetailLevelA={setDetailLevelA}
                    setDetailLevelB={setDetailLevelB}
                    mapsEngineIsReady={mapsEngineIsReady}
                    centerIdx={centerIdx}
                    centerCount={centerCount}
                    setCenterCount={setCenterCount}
                    centerCycle={centerCycle}
                    setCenterCycle={setCenterCycle}
                    setCenterIdx={setCenterIdx}
                    zoomPercent={zoomPercent}
                    setZoomPercent={setZoomPercent}
                    bannerHeight={(bannerHeight === KBannerHeightMin ? 0 : 35) + 306}
                />
            </DialogContent>
            <DialogActions>
                <>
                    {legendState && historyTabIndex === 0 && (
                        <Box
                            sx={{
                                position: "absolute",
                                left: "24px",
                                bottom: "8px",
                                backgroundColor: "white",
                                border: "1px solid gray",
                                borderRadius: "4px",
                                width: "160px",
                                height: "344px",
                                padding: "0px",
                            }}
                        >
                            <img
                                src={mapLegend}
                                alt="legend"
                                width={159}
                                style={{
                                    border: "1px solid gray",
                                    margin: "0 0 6px 0",
                                }}
                            />
                            <StyledCardSubtitleTall>
                                <StyledSliderLabel>
                                    Map Opacity at{" "}
                                    {valuetext(opacityPercent as number)}
                                </StyledSliderLabel>
                                <Slider
                                    sx={{
                                        margin: "0 0 0 16px",
                                        padding: "0",
                                        height: "10px",
                                        maxWidth: "100px",
                                        minWidth: "100px",
                                        display: "inline-block",
                                    }}
                                    aria-label="Custom marks"
                                    value={opacityPercent}
                                    getAriaValueText={valuetext}
                                    step={rangeInc}
                                    min={rangeMin}
                                    max={rangeMax}
                                    valueLabelDisplay="off"
                                    marks={Array.from({ length: (rangeMax - rangeMin) / rangeInc + 1 }, (v, k) => rangeInc * k).map(e => ({
                                        value: e,
                                    }))}
                                    onChange={(
                                        event: Event,
                                        value: number | number[],
                                    ) => setOpacityPercent(value as number)}
                                />
                            </StyledCardSubtitleTall>
                            <StyledCardSubtitleTall>
                                <StyledSliderLabel>
                                    Deforestation &gt;{" "}
                                    {valuetext(deforestationAbovePct as number)}
                                </StyledSliderLabel>
                                <Slider
                                    sx={{
                                        margin: "0 0 0 16px",
                                        padding: "0",
                                        height: "10px",
                                        maxWidth: "100px",
                                        minWidth: "100px",
                                        display: "inline-block",
                                    }}
                                    aria-label="Custom marks"
                                    value={deforestationAbovePct}
                                    getAriaValueText={valuetext}
                                    step={rangeInc2}
                                    min={rangeMin}
                                    max={rangeMax}
                                    valueLabelDisplay="off"
                                    marks={Array.from({ length: (rangeMax - rangeMin) / rangeInc2 + 1 }, (v, k) => rangeInc2 * k).map(e => ({
                                        value: e,
                                    }))}
                                    onChange={(
                                        event: Event,
                                        value: number | number[],
                                    ) =>
                                        setDeforestationAbovePct(
                                            value as number,
                                        )
                                    }
                                />
                            </StyledCardSubtitleTall>
                        </Box>
                    )}
                    <IconButtonNonSave
                        sx={{ mr: 2 }}
                        title="Close history"
                        onClick={() => setModalOpenTrackingProductsHistory(false)}
                        size={"small"}
                    >
                        <CloseIcon />
                    </IconButtonNonSave>
                </>
            </DialogActions>
        </Dialog>
    );
};
