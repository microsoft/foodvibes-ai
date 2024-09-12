import iconDownloaded from "@foodvibes/assets/downloaded.png";
import iconDownloading from "@foodvibes/assets/downloading.png";
import iconLocationBeg from "@foodvibes/assets/location-beg.png";
import iconLocationEnd from "@foodvibes/assets/location-end.png";
import iconLocationMid from "@foodvibes/assets/location-mid.png";
import iconNotAvailable from "@foodvibes/assets/not_available.png";
import iconRejected from "@foodvibes/assets/rejected.png";
import { KApiStatusLoaded, KApiStatusLoading, KApiStatusLocked, KApiStatusPreloaded, KApiStatusRejected, KApiStatusUndefined } from "@foodvibes/utils/commonConstants";
import { ComposeIdKey, FormatTimeDelta, FormatTimestamp, GetAggregationIcon, GetAggregationLabel, GetAggregationLabelColor, GetMovementIcon, GetMovementLabel, GetMovementLabelColor, SetAggregationIndicator } from "@foodvibes/utils/commonFunctions";
import {
    ApiStatusType,
    CommonCoordinates,
    CommonDetailLevel,
    CommonGraphDataType,
    ForestMapRequestType,
    TrackingProductsMapType,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import FvTrackingProductsGraph from "./tabs/FvTrackingProductsGraph";
import FvTrackingProductsJourney from "./tabs/FvTrackingProductsJourney";
import FvTrackingProductsLedger from "./tabs/FvTrackingProductsLedger";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 0 }}>
                    <Typography component="span">{children}</Typography>
                </Box>
            )}
        </Box>
    );
};

const idProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

const selectJourneyData = (
    data: TrackingProductsType[],
    useNewestImageInJourney: boolean, // If true then, in a movement, choose newest image that falls into that movement
): TrackingProductsMapType[] => {
    const movementData: TrackingProductsMapType[] = [];

    if (data) {
        let haveAggregation: boolean = false;
        let haveDisaggregation: boolean = false;
        let trackingProductsRankBeg: number = data.length;
        let trackingProductsRankEnd: number = trackingProductsRankBeg;

        data.forEach((d: TrackingProductsType, idx) => {
            if (d.product_aggregation > 0) {
                haveAggregation = true;
            } else if (d.product_aggregation < 0) {
                haveDisaggregation = true;
            }

            if (d.geotrack_movement) {
                movementData.push({
                    ...d,
                    geotrack_image_url: useNewestImageInJourney ? data[data.length - trackingProductsRankEnd].geotrack_image_url : d.geotrack_image_url,
                    product_aggregation: SetAggregationIndicator(
                        haveAggregation,
                        haveDisaggregation,
                    ),
                    trackingProductsRankBeg,
                    trackingProductsRankEnd,
                });
                haveAggregation = false;
                haveDisaggregation = false;
                trackingProductsRankEnd = trackingProductsRankBeg - 1;
            } else if (idx === data?.length - 1 && movementData?.length) {
                movementData[movementData?.length - 1].trackingProductsRankBeg =
                    trackingProductsRankBeg;
            }

            trackingProductsRankBeg--;
        });
    }

    const movementDataSorted: TrackingProductsMapType[] = movementData.sort(
        (a: TrackingProductsMapType, b: TrackingProductsMapType) =>
            a.tracking_products_tx_id > b.tracking_products_tx_id ? 1 : -1,
    );

    return movementDataSorted;
};

const selectGraphData = (
    journeyData: TrackingProductsMapType[],
    data: TrackingProductsType[],
    graphDirection: boolean,
    graphCompactMode: boolean,
): CommonGraphDataType[] => {
    const graphDataRecs: CommonGraphDataType[] = [];

    journeyData.slice()
        .sort(
            (a, b) =>
                graphDirection ?
                    (a.rank_curr_ledger_id > b.rank_curr_ledger_id ? -1 : 1) :
                    (b.rank_curr_ledger_id < a.rank_curr_ledger_id ? 1 : -1)
        )
        .forEach((journeyRec) => {
            const rowData = data.filter(
                (rec) => rec.rank_curr_ledger_id >= journeyRec.trackingProductsRankBeg && rec.rank_curr_ledger_id <= journeyRec.trackingProductsRankEnd
            );

            if (graphCompactMode) {
                graphDataRecs.push({
                    journeyRec,
                    rowData: rowData.sort((a, b) => a.rank_curr_ledger_id < b.rank_curr_ledger_id ? -1 : 1),
                } as CommonGraphDataType);
            } else {
                rowData.sort(
                    (a, b) =>
                        graphDirection ?
                            (a.rank_curr_ledger_id > b.rank_curr_ledger_id ? -1 : 1) :
                            (b.rank_curr_ledger_id < a.rank_curr_ledger_id ? 1 : -1)
                ).forEach((rec) => {
                    graphDataRecs.push({
                        journeyRec: {
                            ...rec,
                            trackingProductsRankBeg: rec.rank_curr_ledger_id,
                            trackingProductsRankEnd: rec.rank_curr_ledger_id,
                        } as TrackingProductsMapType,
                        rowData: [rec],
                    } as CommonGraphDataType);
                });
            }
        });

    return graphDataRecs;
};

const renderDeforestationDataImage = (status?: string): string => {
    let image: string;
    let title: string;

    switch (status) {
        case KApiStatusPreloaded:
        case KApiStatusLoading:
        case KApiStatusLoaded:
            image = iconDownloading;
            title = "Data loading";
            break;
        case KApiStatusRejected:
            image = iconRejected;
            title = "Data load failed";
            break;
        case KApiStatusLocked:
            image = iconDownloaded;
            title = "Data loaded";
            break;
        default:
            image = iconNotAvailable;
            title = "No data found";
            break;
    }

    return `<img style="position:relative;top:6px;width:20px;height:20px;" src="${image}" alt="${title}" title="${title}" />`;
};

const infoBoxHtmlContentSub = (
    icon: string,
    label: string,
    labelColor: string,
) => {
    const flds: string[] = [];

    if (icon.length) {
        flds.push(`<div style="text-align:center;">`);
        flds.push(`<div class="flags_container">`);
        flds.push(`<span class="flags_container spanL">`);
        flds.push(`<img src="${icon}" alt="${label}" title="${label}" />`);
        flds.push(`</span>`);
        flds.push(
            `<span class="flags_container spanR" style="background-color:${labelColor}">`,
        );
        flds.push(`${label}`);
        flds.push(`</span>`);
        flds.push(`</div>`);
        flds.push(`</div>`);
    }

    return flds.join("");
};

const infoBoxHtmlContentSub2 = (
    icon1: string,
    label1: string,
    icon2: string,
    label2: string,
) => {
    const flds: string[] = [];

    if (icon2.length) {
        flds.push(`<img class="flags_container_single_img" src="${icon2}" alt="${label2}" title="${label2}" />`);
    }

    if (icon1.length) {
        flds.push(`<img class="flags_container_single_img" src="${icon1}" alt="${label1}" title="${label1}" />`);
    }

    return flds.join("");
};

const fmtLatLongValue = (invVal: number): number => Math.round(invVal * 100000000) / 100000000;

const infoBoxHtmlContent = (
    data: TrackingProductsType[],
    idx: number,
    activeDetailLevel: CommonDetailLevel,
    forestMapRequestDict: { [id: string]: ForestMapRequestType },
    deforestationAbovePct: number,
): string => {
    const journey: TrackingProductsType = data[idx];
    const forestMapRequest: ForestMapRequestType =
        forestMapRequestDict[journey.geotrack_ledger_id] ?? {};
    const showDeforestationBanner: boolean =
        !!forestMapRequest.deforestationPct &&
        forestMapRequest.deforestationPct > deforestationAbovePct;
    const flds: string[] = [];
    const aggregationLabelColor: string = GetAggregationLabelColor(
        journey.product_aggregation,
    );
    const aggregationLabel: string = GetAggregationLabel(
        journey.product_aggregation,
    );
    const aggregationIcon: string = GetAggregationIcon(
        journey.product_aggregation,
    );
    const movementLabelColor: string = GetMovementLabelColor(
        journey.geotrack_movement,
    );
    const movementLabel: string = GetMovementLabel(journey.geotrack_movement);
    const movementIcon: string = GetMovementIcon(journey.geotrack_movement);
    const prefix: string = '<div style="font-size:11px;font-weight:normal;display:block;text-align:left;">';
    const prefix2: string = prefix.replace(';"', ';position:relative;top:-10px;height:16px;"');
    const suffix: string = "</b></div>";
    const clickHandler: string = `document.getElementById('javascriptPipe').innerHTML='${idx + 1}'`;

    flds.push(
        '<div style="background-color:#ffffff;border:1px solid #000000;border-radius:6px;min-width:160px;max-width:160px;padding:0px;text-align:left;cursor:default;user-select:none;" ',
    );
    flds.push(
        `title="Dbl-click here to view ledger info, or click the push pin for location zoom" ondblclick="${clickHandler}">`,
    );
    flds.push(
        `<div style="min-width:158px;max-width:160px;background-color:${activeDetailLevel > CommonDetailLevel.min ? "#e0e0e0" : "#ffffff"};`,
    );
    flds.push(
        `color:#000000;font-size:11px;font-weight:bold;display:block;padding:0;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:`,
    );
    flds.push(
        `${activeDetailLevel > CommonDetailLevel.min ? "6px 6px 0 0" : "6px"};">`,
    );

    flds.push(
        `<div style="background-color:#bbbbbb;color:#000000;border-radius:0;height:16px;display:block;margin:0;">`,
    );
    flds.push(
        `<span style="padding:0 6px;height:16px;display:inline-block;margin:0;position:absolute;left:2px;">${idx + 1} of ${data?.length}</span>`,
    );

    if (activeDetailLevel < CommonDetailLevel.high) {
        flds.push(
            infoBoxHtmlContentSub2(
                aggregationIcon,
                aggregationLabel,
                movementIcon,
                movementLabel,
            ),
        );
    }

    flds.push(
        `<span style="position:absolute;right:1px;top:-9px;font-size:18px;background-color:#555555;border-radius:4px 12px 0 0;height:24px;width:26px;padding:1px 0 0 0;`,
    );
    flds.push(
        `border-top:1px solid white;border-right:1px solid white;border-left:1px solid white;"`,
    );
    flds.push(
        ` title="View ledger info" onclick="${clickHandler}">&#x1F4DD;</span>`,
    );

    flds.push(`</div>`);

    flds.push(
        `<div style="border-radius:0;padding:0 6px;display:block;margin:0;width=160px;text-align:center;`,
    );

    if (activeDetailLevel > CommonDetailLevel.low) {
        flds.push(
            `white-space:wrap;max-width:160px;`,
        );
    } else {
        flds.push(
            `height:16px;overflow:hidden;text-overflow:ellipsis;`,
        );
    }

    flds.push(
        `" title="${journey.geotrack_id}">${journey.geotrack_id.replace(':', ': ').replace('-', '- ')}</div>`,
    );

    if (showDeforestationBanner) {
        flds.push(
            `<span style="background-color:#990000;color:#ffffff;border-radius:0;padding:1px 0px 0;height:16px;display:block;margin:0;`,
        );
        flds.push(
            `width:158px;font-size:10.5px;font-weight:100;text-align:center;">Deforestation at ${forestMapRequest.deforestationPct}%</span>`,
        );
    }

    flds.push(`</div>`);

    if (activeDetailLevel > CommonDetailLevel.low) {
        flds.push(
            infoBoxHtmlContentSub(
                aggregationIcon,
                aggregationLabel,
                aggregationLabelColor
            ),
        );
        flds.push(
            infoBoxHtmlContentSub(
                movementIcon,
                movementLabel,
                movementLabelColor,
            ),
        );
    }

    if (activeDetailLevel > CommonDetailLevel.min) {
        flds.push(
            '<div style="background-color:#ffffff;color:#000000;border-radius:6px;display:block;padding:0 6px 6px 6px;">',
        );
        flds.push(
            `<div style="font-size:11px;font-weight:normal;display:inline-block;text-align:center;background-color:#e0e0e0;color:#000000;`,
        );
        flds.push(`white-space:nowrap;max-width:149px;min-width:149px;padding:0;">At <b>${FormatTimestamp(journey.recorded_at)}</b></div>`);

        if (idx > 0) {
            flds.push(
                `${prefix}Travel Time <b>${FormatTimeDelta(data[idx - 1].recorded_at, data[idx].recorded_at)}${suffix}`,
            );
        }

        if (activeDetailLevel > CommonDetailLevel.low) {
            flds.push(
                `${prefix}Latitude <b>${fmtLatLongValue(journey.latitude)}${suffix}`,
            );
            flds.push(
                `${prefix}Longitude <b>${fmtLatLongValue(journey.longitude)}${suffix}`,
            );

            if (activeDetailLevel > CommonDetailLevel.high) {
                flds.push(
                    `${prefix}Geotrack <b>${ComposeIdKey(journey.geotrack_ledger_id, journey.geotrack_tx_id)}${suffix}`,
                );
                flds.push(
                    `${prefix}Forest Cover <b>${forestMapRequest?.deforestationPct ? `${forestMapRequest?.deforestationPct}%` : "n/a"}${suffix}`,
                );
                flds.push(
                    `${prefix2}Deforestation Data <b>${renderDeforestationDataImage(forestMapRequest?.status)}${suffix}`,
                );
            }
        }
        flds.push("</div>");
    }

    flds.push("</div>");

    return flds.join("");
};

const pushPinClickEventHandler = (
    idx: number,
    map: Microsoft.Maps.Map | null,
    data: TrackingProductsMapType[],
    activeDetailLevel: CommonDetailLevel,
    forestMapRequestDict: { [id: string]: ForestMapRequestType },
    infoBoxList: Microsoft.Maps.Infobox[],
    pushPinList: Microsoft.Maps.Pushpin[],
    deforestationAbovePct: number,
    setCenterIdx: (idx: number) => void,
    currMapMovementIdx: number,
): Microsoft.Maps.IHandlerId =>
    Microsoft.Maps.Events.addHandler(pushPinList[idx], "click", () => {
        const visible = !infoBoxList[idx].getVisible();

        infoBoxList[idx].setOptions({
            htmlContent: visible
                ? infoBoxHtmlContent(
                    data,
                    idx,
                    activeDetailLevel,
                    forestMapRequestDict,
                    deforestationAbovePct,
                )
                : "",
            visible,
        });

        if (map) {
            const viewOptions = {
                mapTypeId: Microsoft.Maps.MapTypeId.aerial,
                center: pushPinList[idx].getLocation(),
                zoom: 16,
            };
            try {
                map.setView(viewOptions);
                setCenterIdx(currMapMovementIdx + 1);
            }
            catch {
                console.error("Error setting view with options", viewOptions);
            }
        }
    });

const addPushPinClickHandler = (
    idx: number,
    data: TrackingProductsMapType[],
    map: Microsoft.Maps.Map | null,
    activeDetailLevel: CommonDetailLevel,
    forestMapRequestDict: { [id: string]: ForestMapRequestType },
    infoBoxList: Microsoft.Maps.Infobox[],
    pushPinList: Microsoft.Maps.Pushpin[],
    pushPinClickHandlerList: Microsoft.Maps.IHandlerId[],
    deforestationAbovePct: number,
    setCenterIdx: (idx: number) => void,
    currMapMovementIdx: number,
): void => {
    if (pushPinClickHandlerList.length > idx) {
        Microsoft.Maps.Events.removeHandler(pushPinClickHandlerList[idx]);

        pushPinClickHandlerList[idx] = pushPinClickEventHandler(
            idx,
            map,
            data,
            activeDetailLevel,
            forestMapRequestDict,
            infoBoxList,
            pushPinList,
            deforestationAbovePct,
            setCenterIdx,
            currMapMovementIdx,
        );
    } else {
        pushPinClickHandlerList.push(
            pushPinClickEventHandler(
                idx,
                map,
                data,
                activeDetailLevel,
                forestMapRequestDict,
                infoBoxList,
                pushPinList,
                deforestationAbovePct,
                setCenterIdx,
                currMapMovementIdx,
            ),
        );
    }
};

export default function FvTrackingProductsHistory({
    data, // data is in descending order of tracking_products_tx_id value
    forestMapRequestDict,
    fetchAdma,
    fetchForestMap,
    setForestMapState,
    graphCompactMode,
    setGraphCompactMode,
    graphDirection,
    setGraphDirection,
    historyTabIndex,
    setHistoryTabIndex,
    legendState,
    setLegendState,
    opacityPercent,
    deforestationAbovePct,
    isPickerOpenLedger,
    pickerOpenLedger,
    detailLevelA,
    detailLevelB,
    setDetailLevelA,
    setDetailLevelB,
    mapsEngineIsReady,
    centerIdx,
    centerCount,
    centerCycle,
    setCenterCount,
    setCenterCycle,
    setCenterIdx,
    zoomPercent,
    setZoomPercent,
    bannerHeight,
}: {
    data: TrackingProductsType[];
    forestMapRequestDict: { [id: number]: ForestMapRequestType };
    fetchAdma: (
        geotrackLedgerId: string,
        coordinates: CommonCoordinates,
    ) => void;
    fetchForestMap: (forestMapRequest: ForestMapRequestType) => void;
    setForestMapState: (ledgerId: string, status: ApiStatusType) => void;
    graphCompactMode: boolean;
    setGraphCompactMode: (graphCompactMode: boolean) => void;
    graphDirection: boolean;
    setGraphDirection: (graphDirection: boolean) => void;
    historyTabIndex: number;
    setHistoryTabIndex: (idx: number) => void;
    legendState: boolean;
    setLegendState: (legendState: boolean) => void;
    opacityPercent: number;
    deforestationAbovePct: number;
    isPickerOpenLedger: boolean;
    pickerOpenLedger: (payload: boolean) => void;
    detailLevelA: CommonDetailLevel;
    detailLevelB: CommonDetailLevel;
    setDetailLevelA: (detailLevel: CommonDetailLevel) => void;
    setDetailLevelB: (detailLevel: CommonDetailLevel) => void;
    mapsEngineIsReady: boolean | null;
    centerIdx: number;
    centerCycle: boolean;
    centerCount: number;
    setCenterCount: (count: number) => void;
    setCenterCycle: (on: boolean) => void;
    setCenterIdx: (idx: number) => void;
    zoomPercent: number;
    setZoomPercent: (zoomPercent: number) => void;
    bannerHeight: number;
}) {
    if (!data?.length) {
        return;
    }

    const containerTop: React.MutableRefObject<null> | null = useRef<null>(null);
    const handleChange = (event: React.SyntheticEvent, idx: number) => {
        setHistoryTabIndex(idx);
        setCenterCycle(false);

        if (idx !== 0) {
            resetMap();
        }
    }
    // journeyData is in ascending order of tracking_products_tx_id value
    const journeyData = useMemo<TrackingProductsMapType[]>(
        () => selectJourneyData(data, detailLevelB === CommonDetailLevel.min && graphCompactMode),
        [data, detailLevelB, graphCompactMode],
    );
    const graphData: CommonGraphDataType[] = useMemo(() =>
        selectGraphData(journeyData, data, graphDirection, graphCompactMode), [journeyData, graphDirection]);

    const latestRow = useMemo<TrackingProductsMapType | null>(
        () =>
            journeyData?.length ? journeyData[journeyData.length - 1] : null,
        [journeyData],
    );
    const fetchedMappedJourneyCount: number = useMemo<number>(
        () =>
            journeyData.filter(d => {
                const key: string = d.geotrack_ledger_id.toString();

                return forestMapRequestDict[key] &&
                    (forestMapRequestDict[key].status === KApiStatusLocked ||
                        forestMapRequestDict[key].status === KApiStatusRejected)
                    ? d
                    : null;
            }).length,
        [journeyData],
    );
    const [currMapMovementIdx, setCurrMapMovementIdx] = useState<number>(-1);
    const [map, setMap] = useState<Microsoft.Maps.Map | null>(null);
    const mapContainerM: React.MutableRefObject<null> | null = useRef(null);
    const [lastOpacityPercent, setLastOpacityPercent] = useState<number>(-1);
    const [infoBoxList, setInfoBoxList] = useState<Microsoft.Maps.Infobox[]>([]);
    const [pushPinList, setPushPinList] = useState<Microsoft.Maps.Pushpin[]>([]);
    const [pushPinClickHandlerList, setPushPinClickHandlerList] = useState<Microsoft.Maps.IHandlerId[]>([]);

    const resetMap = () => {
        if (map) {
            pushPinClickHandlerList.forEach((h) => {
                Microsoft.Maps.Events.removeHandler(h);
            });

            for (let key in forestMapRequestDict) {
                const entry: ForestMapRequestType = forestMapRequestDict[key];

                if (entry.status === KApiStatusLocked) {
                    setForestMapState(key, { status: KApiStatusLoaded }); // Reset state so that the layer could be redrawn
                }
            }

            setInfoBoxList([]);
            setPushPinList([]);
            setPushPinClickHandlerList([]);
            setMap(null); // Reset map so that it could be redrawn
        }
    };

    useEffect(() => {
        if (currMapMovementIdx > -1) {
            setCenterCycle(false);
            pickerOpenLedger(true);
        }
    }, [currMapMovementIdx]);
    useEffect(() => {
        setCenterCount(journeyData?.length ?? 0);
    }, [journeyData]);
    useEffect(() => {
        if (journeyData.length === fetchedMappedJourneyCount) {
            return;
        }

        journeyData.forEach((d: TrackingProductsMapType) => {
            const key: string = d.geotrack_ledger_id.toString();

            if (!forestMapRequestDict[key]) {
                setForestMapState(key, { status: KApiStatusUndefined });
            } else {
                switch (forestMapRequestDict[key].status) {
                    case KApiStatusUndefined:
                        // New key so initiate the sequence (see slice for state transition info)
                        // setForestMapState(key, { status: KApiStatusPreloaded });
                        fetchAdma(key, {
                            latitude: d.latitude,
                            longitude: d.longitude,
                        });
                        break;
                    case KApiStatusPreloaded:
                        // Adma response has completed so fetch the map based on geoJson from Adma
                        fetchForestMap(forestMapRequestDict[key]);
                        break;
                }
            }
        });
    }, [journeyData, forestMapRequestDict]);
    useEffect(() => {
        if (journeyData.length !== fetchedMappedJourneyCount) {
            return;
        }

        journeyData.forEach((d: TrackingProductsMapType) => {
            const key: string = d.geotrack_ledger_id.toString();

            if (forestMapRequestDict[key].status === KApiStatusLocked) {
                // Reset state so that the layer could be redrawn
                setForestMapState(key, { status: KApiStatusLoaded });
            }
        });
    }, [fetchedMappedJourneyCount]);
    useEffect(() => {
        if (
            map ||
            !mapContainerM?.current ||
            !mapsEngineIsReady ||
            historyTabIndex !== 0
        ) {
            return;
        }

        if (!map && infoBoxList?.length === 0 && journeyData?.length) {
            const center: Microsoft.Maps.Location = new Microsoft.Maps.Location(
                journeyData[0].latitude,
                journeyData[0].longitude,
            );
            const journeyMap = new Microsoft.Maps.Map(
                mapContainerM.current as HTMLElement,
                {
                    center,
                    zoom: 1,
                    navigationBarMode: Microsoft.Maps.NavigationBarMode.compact,
                    showBreadcrumb: true,
                    showDashboard: true,
                    showMapTypeSelector: true,
                    showScalebar: true,
                    showZoomButtons: true,
                    showLogo: false,
                    liteMode: true,
                    enableHighDpi: true,
                    showTrafficButton: false,
                    mapTypeId: Microsoft.Maps.MapTypeId.road,
                    showTermsLink: false,
                },
            );
            // const locations: Microsoft.Maps.Location[] = [center]
            let currLocation: Microsoft.Maps.Location = center;
            let prevLocation: Microsoft.Maps.Location;

            journeyData.forEach((d: TrackingProductsMapType, idx) => {
                if (idx > 0) {
                    prevLocation = currLocation;
                    currLocation = new Microsoft.Maps.Location(
                        d.latitude,
                        d.longitude,
                    );
                    const polyline = new Microsoft.Maps.Polyline(
                        [prevLocation, currLocation],
                        {
                            strokeColor: "blue",
                            strokeThickness: 4,
                            strokeDashArray: [1, 2],
                        },
                    );

                    journeyMap.entities.push(polyline);
                    // locations.push(currLocation);
                }

                const infoBox = new Microsoft.Maps.Infobox(currLocation, {
                    offset: new Microsoft.Maps.Point(-80, +25),
                    htmlContent: "",
                    showPointer: true,
                    zIndex: 8888,
                });
                const pushPin = new Microsoft.Maps.Pushpin(currLocation, {
                    // title: `${idx + 1} of ${journeyData?.length}`,
                    icon:
                        idx > 0
                            ? idx + 1 === journeyData?.length
                                ? iconLocationEnd
                                : iconLocationMid
                            : iconLocationBeg,
                });
                journeyMap.entities.push(pushPin);
                infoBox.setMap(journeyMap);
                infoBoxList.push(infoBox);
                pushPinList.push(pushPin);
                // Microsoft.Maps.Events.addHandler(infoBox, "click", () => {
                //     setCurrMapMovementIdx(idx);
                // });
                Microsoft.Maps.Events.addHandler(infoBox, "click", () => {
                    infoBoxList.forEach((i, idx2) => {
                        infoBoxList[idx2].setOptions({
                            zIndex: idx2 === idx ? 8889 : 8888,
                        });
                    });
                });
                addPushPinClickHandler(
                    idx,
                    journeyData,
                    journeyMap,
                    detailLevelA,
                    forestMapRequestDict,
                    infoBoxList,
                    pushPinList,
                    pushPinClickHandlerList,
                    deforestationAbovePct,
                    setCenterIdx,
                    currMapMovementIdx,
                );
            });
            setMap(journeyMap);
        }
    }, [
        map,
        journeyData,
        mapsEngineIsReady,
        detailLevelA,
        infoBoxList,
        historyTabIndex,
    ]);

    useEffect(() => {
        if (!map || infoBoxList?.length !== journeyData?.length) {
            return;
        }

        journeyData.forEach((d: TrackingProductsMapType, idx) => {
            infoBoxList[idx].setOptions({
                htmlContent: infoBoxHtmlContent(
                    journeyData,
                    idx,
                    detailLevelA,
                    forestMapRequestDict,
                    deforestationAbovePct,
                ),
                visible: true,
            });
            addPushPinClickHandler(
                idx,
                journeyData,
                map,
                detailLevelA,
                forestMapRequestDict,
                infoBoxList,
                pushPinList,
                pushPinClickHandlerList,
                deforestationAbovePct,
                setCenterIdx,
                currMapMovementIdx,
            );
        });
    }, [
        map,
        detailLevelA,
        infoBoxList,
        data,
        journeyData,
        forestMapRequestDict,
        deforestationAbovePct,
    ]);

    useEffect(() => {
        if (!map) {
            return;
        }

        for (let key in forestMapRequestDict) {
            const entry: ForestMapRequestType = forestMapRequestDict[key];

            if (
                entry.geojson?.geometry?.coordinates?.length &&
                entry.geojson?.geometry?.coordinates[0].length &&
                entry.imageUrl &&
                (entry.status === KApiStatusLoaded ||
                    lastOpacityPercent !== opacityPercent)
            ) {
                setForestMapState(key, { status: KApiStatusLocked });

                const foundLayer = map.layers.find(
                    e => e._groundOverlayOptions.imageUrl === entry.imageUrl,
                );

                if (foundLayer) {
                    map.layers.remove(foundLayer);
                }

                console.info(
                    "Drawing image for geotrack ledger id",
                    entry.id,
                    "from url",
                    entry.imageUrl,
                );
                entry.geojson.geometry.coordinates[0].forEach((e, idx) => {
                    const lat = e[1];
                    const lon = e[0];

                    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
                        console.error("Bad lat/long", idx, lat, lon);
                    }
                });

                const bounds: Microsoft.Maps.LocationRect =
                    Microsoft.Maps.LocationRect.fromLocations(
                        entry.geojson.geometry.coordinates[0].map(
                            e => new Microsoft.Maps.Location(e[1], e[0]),
                        ),
                    );
                const imageLayer = new Microsoft.Maps.GroundOverlay({
                    imageUrl: entry.imageUrl,
                    bounds,
                    opacity: opacityPercent / 100,
                });

                map.layers.insert(imageLayer);
            }
        }

        setLastOpacityPercent(opacityPercent);
    }, [map, forestMapRequestDict, opacityPercent]);

    useEffect(() => {
        if (!map || !journeyData || centerIdx > centerCount) {
            return;
        }

        let viewOptions: Microsoft.Maps.IViewOptions = {
            padding: 400,
            zoom: 16,
        };

        if (centerIdx > 0) {
            viewOptions = {
                ...viewOptions,
                center: new Microsoft.Maps.Location(
                    journeyData[centerIdx - 1].latitude,
                    journeyData[centerIdx - 1].longitude,
                ),
                mapTypeId: Microsoft.Maps.MapTypeId.aerial,
            };
        } else {
            const locations: Microsoft.Maps.Location[] = journeyData.map(
                (d: TrackingProductsMapType) =>
                    new Microsoft.Maps.Location(d.latitude, d.longitude),
            );

            viewOptions = {
                ...viewOptions,
                bounds: Microsoft.Maps.LocationRect.fromLocations(locations),
                padding: locations.length > 1 ? 160 : 400,
                mapTypeId: Microsoft.Maps.MapTypeId.road,
            };
        }

        try {
            map.setView(viewOptions);
        }
        catch {
            console.error("Error setting view with options", viewOptions);
        }
    }, [map, journeyData, centerIdx]);

    useEffect(() => {
        if (containerTop?.current) {
            (containerTop.current as HTMLElement).scrollIntoView({
                behavior: "instant",
            });
        }
    }, [containerTop?.current, historyTabIndex]);

    return (
        <Box sx={{ width: "100%", height: "100%" }} ref={containerTop}>
            <Box sx={{ borderBottom: 4, borderColor: "divider" }}>
                <Tabs
                    value={historyTabIndex}
                    onChange={handleChange}
                    aria-label="Tracking Products tabs"
                >
                    <Tab label="Journey" {...idProps(0)} />
                    <Tab label="Ledger" {...idProps(1)} />
                    <Tab label="Graph" {...idProps(2)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={historyTabIndex} index={0}>
                <FvTrackingProductsJourney
                    data={data}
                    journeyData={journeyData}
                    legendState={legendState}
                    setLegendState={setLegendState}
                    opacityPercent={opacityPercent}
                    deforestationAbovePct={deforestationAbovePct}
                    isPickerOpenLedger={isPickerOpenLedger}
                    pickerOpenLedger={pickerOpenLedger}
                    detailLevelA={detailLevelA}
                    detailLevelB={detailLevelB}
                    setDetailLevelA={setDetailLevelA}
                    setDetailLevelB={setDetailLevelB}
                    mapsEngineIsReady={mapsEngineIsReady}
                    centerCount={centerCount}
                    centerIdx={centerIdx}
                    setCenterIdx={setCenterIdx}
                    centerCycle={centerCycle}
                    setCenterCycle={setCenterCycle}
                    setCurrMapMovementIdx={setCurrMapMovementIdx}
                    currMapMovementIdx={currMapMovementIdx}
                    latestRow={latestRow}
                    mapContainerM={mapContainerM}
                    bannerHeight={bannerHeight}
                />
            </CustomTabPanel>
            <CustomTabPanel value={historyTabIndex} index={1}>
                <FvTrackingProductsLedger
                    data={data}
                    trackingProductsRankToView={data.length}
                    isModal={false}
                    detailLevel={detailLevelB}
                    setDetailLevel={setDetailLevelB}
                    mapsEngineIsReady={mapsEngineIsReady}
                    isAutoHeight={false}
                    bannerHeight={bannerHeight}
                />
            </CustomTabPanel>
            <CustomTabPanel value={historyTabIndex} index={2}>
                <FvTrackingProductsGraph
                    data={data}
                    graphData={graphData}
                    trackingProductsRankToView={data.length}
                    detailLevel={detailLevelB}
                    setDetailLevel={setDetailLevelB}
                    graphCompactMode={graphCompactMode}
                    setGraphCompactMode={setGraphCompactMode}
                    graphDirection={graphDirection}
                    setGraphDirection={setGraphDirection}
                    mapsEngineIsReady={mapsEngineIsReady}
                    isAutoHeight={false}
                    zoomPercent={zoomPercent}
                    setZoomPercent={setZoomPercent}
                    forestMapRequestDict={forestMapRequestDict}
                    deforestationAbovePct={deforestationAbovePct}
                    bannerHeight={bannerHeight}
                />
            </CustomTabPanel>
        </Box>
    );
}
