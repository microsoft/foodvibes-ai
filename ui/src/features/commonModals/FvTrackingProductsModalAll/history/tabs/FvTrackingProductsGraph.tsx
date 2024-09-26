import iconTrackingProducts from "@foodvibes/assets/tracking-products.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { FvIconCommonInner } from "@foodvibes/components/FvIconCommon";
import FvTrackingProductsEntryTile from "@foodvibes/components/FvTrackingProductsEntryTile";
import { KLabelTrackingProducts } from "@foodvibes/utils/commonConstants";
import { ComposeIdKey } from "@foodvibes/utils/commonFunctions";
import {
    CommonCallBack,
    CommonDetailLevel,
    CommonGraphDataType,
    ForestMapRequestType,
    TrackingProductsMapType,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import { Box, Grid } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArcherContainer, ArcherElement } from "react-archer";
import { AnchorPositionType } from "react-archer/lib/types";

const RenderSingleLocationActivities = ({
    graphDirection,
    graphCompactMode,
    cnt,
    journeyRec,
    rowData,
    trackingProductsRankToView,
    mapsEngineIsReady,
    isAutoHeight,
    detailLevel,
    arrowRef,
    scrollToRef,
}: {
    graphDirection: boolean;
    graphCompactMode: boolean;
    cnt: number;
    journeyRec: TrackingProductsMapType;
    rowData: TrackingProductsType[];
    trackingProductsRankToView: number;
    mapsEngineIsReady: boolean | null;
    isAutoHeight: boolean;
    detailLevel: CommonDetailLevel;
    arrowRef: React.MutableRefObject<null> | null;
    scrollToRef: React.MutableRefObject<null> | null;
}
): JSX.Element => {
    if (!rowData?.length) {
        return <></>
    }

    const borderWidth: number = useMemo<number>(() => detailLevel === CommonDetailLevel.min ? 0 : 2, [detailLevel]);
    const nodeWidth: number = useMemo<number>(() => detailLevel === CommonDetailLevel.min ? 60 : 280, [detailLevel]);
    const nodeHeight: string = useMemo<string>(() => detailLevel === CommonDetailLevel.min ? "60px" : "auto", [detailLevel]);

    return (
        <Grid container spacing={0} component="div">
            <Box component="div"
                ref={arrowRef}
                style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    width: "auto",
                }}>
                {detailLevel === CommonDetailLevel.min && (
                    <Box component="div"
                        title={`[${ComposeIdKey(journeyRec.geotrack_ledger_id, journeyRec.geotrack_tx_id)}] ${journeyRec.geotrack_id}`}
                        sx={{
                            maxWidth: "200px",
                            minWidth: "200px",
                            backgroundColor: detailLevel > CommonDetailLevel.min ? "inherit" : "black",
                        }}>
                        <Box component="div" sx={{
                            margin: "17px 0 0 6px",
                            padding: "2px 0 4px 6px",
                            fontSize: "0.8em",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                            minWidth: "200px",
                            display: "inline-block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                            backgroundColor: "#606060",
                            color: "white",
                            borderRadius: "6px",
                        }}>{journeyRec.geotrack_id}
                            <Box component="div" sx={{
                                padding: "3px",
                                width: "188px",
                                height: "52px",
                                color: "white",
                                textAlign: "center",
                                borderRadius: "6px",
                                backgroundColor: detailLevel > CommonDetailLevel.min ? "inherit" : "black",
                            }}>
                                <FvIconCommonInner image_url={journeyRec.geotrack_image_url} />
                            </Box>
                        </Box>
                    </Box>
                )}
                {rowData.map((rec: TrackingProductsType, idx: number) => {
                    const idx2: number = cnt - rec.rank_curr_ledger_id;
                    let sourceAnchor: AnchorPositionType = idx < rowData.length - 1 ? 'right' : 'bottom';
                    let targetAnchor: AnchorPositionType = idx < rowData.length - 1 ? 'left' : 'top';

                    if (graphDirection) {
                        targetAnchor = idx < rowData.length - 1 ? 'left' : 'bottom';
                        sourceAnchor = idx < rowData.length - 1 ? 'right' : 'top';
                    };

                    return (
                        <ArcherElement
                            key={`trackingProducts${idx2}`}
                            id={`node_${idx2}`}
                            relations={idx2 > 0 ? [{
                                targetId: `node_${idx2 - 1}`,
                                targetAnchor,
                                sourceAnchor,
                            }] : []}
                        >
                            <Box component="div"
                                sx={{
                                    border: `${borderWidth}px solid gray`,
                                    borderRadius: `${detailLevel > CommonDetailLevel.min ? 2 : 10}px`,
                                    padding: `0 0 0 {detailLevel > CommonDetailLevel.min ? 0 : 2}px`,
                                    margin: "30px 20px",
                                    maxWidth: `${nodeWidth}px`,
                                    minWidth: `${nodeWidth}px`,
                                    maxHeight: nodeHeight,
                                    minHeight: nodeHeight,
                                }}>
                                <FvTrackingProductsEntryTile
                                    rec={rec}
                                    cnt={cnt}
                                    idx={idx2}
                                    trackingProductsRankToView={trackingProductsRankToView}
                                    isModal
                                    isTile
                                    detailLevel={detailLevel}
                                    mapsEngineIsReady={mapsEngineIsReady}
                                    scrollToRef={scrollToRef}
                                />
                            </Box>
                        </ArcherElement>
                    )
                })}
                {detailLevel === CommonDetailLevel.min && !graphCompactMode && (
                    <Box component="div" title={rowData[0].notes} sx={{
                        maxWidth: "200px",
                        minWidth: "200px",
                        backgroundColor: detailLevel > CommonDetailLevel.min ? "inherit" : "black",
                    }}>
                        <Box component="div" sx={{
                            margin: "50px 0 0 0",
                            fontSize: "0.8em",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            backgroundColor: "black",
                            color: "white",
                        }}>
                            {rowData[0].notes}
                        </Box>
                    </Box>
                )}
            </Box>
        </Grid>
    );
};

export default function FvTrackingProductsGraph({
    data, // data is in descending order of tracking_products_tx_id value
    graphData,
    trackingProductsRankToView,
    detailLevel,
    setDetailLevel,
    graphCompactMode,
    setGraphCompactMode,
    graphDirection,
    setGraphDirection,
    mapsEngineIsReady,
    isAutoHeight,
    noHeader,
    noBody,
    zoomPercent,
    setZoomPercent,
    forestMapRequestDict,
    deforestationAbovePct,
    bannerHeight,
}: {
    data: TrackingProductsType[];
    graphData: CommonGraphDataType[];
    trackingProductsRankToView: number;
    detailLevel: CommonDetailLevel;
    setDetailLevel: (detailLevel: CommonDetailLevel) => void;
    graphCompactMode: boolean;
    setGraphCompactMode: (graphCompactMode: boolean) => void;
    graphDirection: boolean;
    setGraphDirection: (graphDirection: boolean) => void;
    mapsEngineIsReady: boolean | null;
    isAutoHeight: boolean;
    noHeader?: boolean;
    noBody?: boolean;
    zoomPercent?: number;
    setZoomPercent: (zoomPercent: number) => void;
    forestMapRequestDict: { [id: string]: ForestMapRequestType };
    deforestationAbovePct: number;
    bannerHeight: number;
}): JSX.Element | undefined {
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [initalLayoutCompleted, setInitalLayoutCompleted] = useState<boolean>(false);
    const containerRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const containerTop: React.MutableRefObject<null> | null = useRef<null>(null);
    const outerRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const outerRef2: React.MutableRefObject<null> | null = useRef<null>(null);
    const arrowRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const scrollToRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const scrollToRefTop: React.MutableRefObject<null> | null = useRef<null>(null);
    const heightValue: string = isAutoHeight ? "auto" : `calc(100vh - ${bannerHeight}px)`;
    const latestRow = useMemo<TrackingProductsType | null>(
        () => (data?.length ? data[0] : null),
        [data],
    );
    // useEffect(() => {
    //     if (scrollToRef?.current) {
    //         (scrollToRef.current as HTMLElement).scrollIntoView({
    //             behavior: "instant",
    //         });
    //     }
    // }, [scrollToRef?.current]);
    // useEffect(() => {
    //     if (scrollToRefTop?.current) {
    //         (scrollToRefTop.current as HTMLElement).scrollIntoView({
    //             behavior: "instant",
    //         });
    //     }
    // }, [scrollToRefTop?.current, detailLevel]);
    // useEffect(() => {
    //     if (!initalLayoutCompleted && containerTop?.current && arrowRef?.current) {
    //         (arrowRef.current as HTMLElement).scrollIntoView({
    //             behavior: "instant",
    //         });
    //         (containerTop.current as HTMLElement).scrollIntoView({
    //             behavior: "instant",
    //         });
    //         setInitalLayoutCompleted(true);
    //     }
    // }, [containerTop?.current, arrowRef?.current, containerRef?.current]);

    useEffect(() => {
        if (!initalLayoutCompleted && containerTop?.current) {
            (containerTop.current as HTMLElement).scrollIntoView({
                behavior: "instant",
            });
            setInitalLayoutCompleted(true);
        }
    }, [containerTop?.current, arrowRef?.current, containerRef?.current]);

    const onResize = useCallback(() => {
        if (outerRef?.current) {
            const dimensions = (outerRef.current as HTMLElement).getBoundingClientRect();
            console.warn(dimensions);

            const newHeight = dimensions.bottom - dimensions.top;
            const newWidth = dimensions.right - dimensions.left;
            console.info('outerRef', newWidth, newHeight);

            if (newHeight !== containerHeight || newWidth !== containerWidth) {
                setContainerHeight(newHeight);
                setContainerWidth(newWidth);

                if (containerRef?.current) {
                    (containerRef.current as any).refreshScreen();
                }
            }
        }
    }, []);

    const onResizeOuter = (outerRefEl: HTMLElement | null) => {
        if (outerRefEl) {
            // (outerRef.current as HTMLElement).addEventListener("resize", onResize);
            outerRefEl.addEventListener("scroll", onResize);
            onResize();
            return () => {
                if (outerRefEl) {
                    // (outerRef.current as HTMLElement).removeEventListener("resize", onResize);
                    outerRefEl.removeEventListener("scroll", onResize);
                }
            };
        }
    };

    useEffect(() => {
        setTimeout(() => {
            onResizeOuter(outerRef?.current as HTMLElement | null);
            setTimeout(() => {
                onResizeOuter(outerRef?.current as HTMLElement | null);
            }, 500);
        }, 250);
    }, [outerRef?.current, graphCompactMode, setDetailLevel]);
    const onResize2 = useCallback(() => {
        if (outerRef2?.current) {
            const dimensions = (outerRef2.current as HTMLElement).getBoundingClientRect();
            console.warn(dimensions);

            const newHeight = dimensions.bottom - dimensions.top;
            const newWidth = dimensions.right - dimensions.left;
            console.info('outerRef2', newWidth, newHeight);

            if (newHeight !== containerHeight || newWidth !== containerWidth) {
                setContainerHeight(newHeight);
                setContainerWidth(newWidth);

                if (containerRef?.current) {
                    (containerRef.current as any).refreshScreen();
                }
            }
        }
    }, []);
    useEffect(() => {
        if (outerRef2?.current) {
            // (outerRef2.current as HTMLElement).addEventListener("resize", onResize);
            (outerRef2.current as HTMLElement).addEventListener("scroll", onResize);
            onResize2();
            return () => {
                if (outerRef2?.current) {
                    // (outerRef2.current as HTMLElement).removeEventListener("resize", onResize);
                    (outerRef2.current as HTMLElement).removeEventListener("scroll", onResize);
                }
            };
        }
    }, [outerRef2?.current, graphCompactMode]);
    const arrowColor = useMemo<string>(() => {
        if (detailLevel < CommonDetailLevel.low && forestMapRequestDict) {
            for (let key in forestMapRequestDict) {
                const value = forestMapRequestDict[key];

                if (value.deforestationPct && value.deforestationPct > deforestationAbovePct) {
                    return "red";
                }
            }

            return "green";
        }

        return "purple";
    }, [detailLevel, forestMapRequestDict, deforestationAbovePct]);

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
        detailLevel,
        graphCompactMode,
        setGraphCompactMode,
        graphDirection,
        setGraphDirection,
        zoomPercent,
        setZoomPercent,
        noHeader,
        noBody,
        noRibbon: data ? false : true,
        setDetailLevel,
        contentCb: noBody
            ? null
            : (payload: CommonCallBack) =>
                <Box
                    component="div"
                    sx={{
                        maxHeight: heightValue,
                        minHeight: heightValue,
                        overflow: "auto",
                        backgroundColor: detailLevel > CommonDetailLevel.min ? "inherit" : "black",
                    }}
                >
                    <Box
                        sx={{
                            zoom: (zoomPercent ?? 100) / 100,
                        }}
                        ref={scrollToRefTop}
                    >
                        <ArcherContainer
                            ref={containerRef}
                            strokeColor={arrowColor}
                            svgContainerStyle={{
                                height: `${containerHeight}px`,
                                width: `${containerWidth}px`,
                                position: "absolute",
                                top: 0,
                                left: 0,
                            }}
                        >
                            <Box
                                component="div"
                                sx={{
                                    overflow: "auto",
                                }}
                                ref={outerRef}
                            >
                                {graphData.map((e, idx) => (
                                    <RenderSingleLocationActivities
                                        key={`journeyRec${idx}`}
                                        graphDirection={graphDirection}
                                        graphCompactMode={graphCompactMode}
                                        cnt={data.length}
                                        journeyRec={e.journeyRec}
                                        rowData={e.rowData}
                                        trackingProductsRankToView={trackingProductsRankToView}
                                        mapsEngineIsReady={mapsEngineIsReady}
                                        isAutoHeight={isAutoHeight}
                                        detailLevel={payload.detailLevel}
                                        arrowRef={idx === 0 ? containerTop : arrowRef}
                                        scrollToRef={scrollToRef}
                                    />
                                ))}
                            </Box >
                        </ArcherContainer>
                    </Box>
                </Box>
    });
}
