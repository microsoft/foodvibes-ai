import iconGeotrack from "@foodvibes/assets/geotrack.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLabelGeotrack, KLedgerTypeGeotrack } from "@foodvibes/utils/commonConstants";
import {
    ComposeIdKey,
    FormatTimestamp,
} from "@foodvibes/utils/commonFunctions";
import {
    StyledGridItem,
    StyledGridItemLabel,
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonDetailLevel,
    GeotrackType,
} from "@foodvibes/utils/commonTypes";
import { Box, Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import "bingmaps"; // <--  Microsoft supported types library for Microsoft.Maps
import { useEffect, useRef, useState } from "react";
import { FvIconCommon } from "./FvIconCommon";

export default function FvCardGeotrack({
    data,
    detailLevel = CommonDetailLevel.low,
    canEdit,
    headerContentCb,
    mapsEngineIsReady,
    isModal = false,
    isTile = false,
    mapPinIconToUse,
}: {
    data: GeotrackType | null;
    detailLevel?: CommonDetailLevel;
    canEdit?: boolean;
    headerContentCb?: (payload: CommonCallBack) => JSX.Element;
    mapsEngineIsReady: boolean | null;
    isModal?: boolean;
    isTile?: boolean;
    mapPinIconToUse?: string;
}) {
    const mapContainerM: React.MutableRefObject<null> | null = useRef(null);
    const [mapIsReady, setMapIsReady] = useState<boolean>(false);

    useEffect(() => {
        if (mapIsReady && data) {
            // We get here if data is changed after map has been rendered
            setMapIsReady(false);
        }
    }, [data, mapIsReady]);

    useEffect(() => {
        if (mapIsReady || !mapContainerM?.current || !mapsEngineIsReady) {
            return;
        }

        setMapIsReady(true);

        if (data) {
            const center: Microsoft.Maps.Location = new Microsoft.Maps.Location(
                data.latitude,
                data.longitude,
            );
            const map = new Microsoft.Maps.Map(
                mapContainerM.current as HTMLElement,
                {
                    center,
                    zoom: 2,
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
            const pushPin = new Microsoft.Maps.Pushpin(center, {
                icon: mapPinIconToUse,
            });
            map.entities.push(pushPin);
            map.setView({
                mapTypeId: Microsoft.Maps.MapTypeId.road,
                bounds: Microsoft.Maps.LocationRect.fromLocations(center),
                padding: 80,
            });
        }
    }, [data, mapContainerM?.current, mapsEngineIsReady]);

    return FvCardCommon({
        iconToUse: iconGeotrack,
        idToUse: data?.geotrack_id,
        type: KLedgerTypeGeotrack,
        tag: KLabelGeotrack,
        title: data?.geotrack_ledger_id
            ? ComposeIdKey(data?.geotrack_ledger_id, data?.geotrack_tx_id)
            : "",
        operationName: data?.operation_name,
        username: data?.username,
        imageUrl: data?.image_url,
        canEdit,
        detailLevel,
        isModal,
        isTile,
        noRibbon: data ? false : true,
        headerContentCb,
        contentCb: (payload: CommonCallBack) => (
            <Typography variant="body2" component="div" color="text.primary">
                {data?.geotrack_id && payload.detailLevel > CommonDetailLevel.low && (
                    <Grid
                        container
                        spacing={0}
                    >
                        <Grid item xs={12}>
                            <Grid container spacing={0}>
                                <StyledGridItemLabel item xs={3}>
                                    Entered By:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.username}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Latitude:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.latitude}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Longitude:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.longitude}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Name:
                                </StyledGridItemLabel>
                                <StyledGridItem
                                    item
                                    xs={9}
                                    title={data?.name}
                                >
                                    {data?.name}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    details:
                                </StyledGridItemLabel>
                                <StyledGridItem
                                    item
                                    xs={9}
                                    title={data?.details}
                                >
                                    {data?.details}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Properties:
                                </StyledGridItemLabel>
                                <StyledGridItem
                                    item
                                    xs={9}
                                    title={data?.properties}
                                >
                                    {data?.properties}
                                </StyledGridItem>
                                {payload.detailLevel >
                                    CommonDetailLevel.high && (
                                        <>
                                            <StyledGridItemLabel item xs={3}>
                                                Recorded:
                                            </StyledGridItemLabel>
                                            <StyledGridItem item xs={9}>
                                                {FormatTimestamp(
                                                    data?.recorded_at,
                                                )}
                                            </StyledGridItem>
                                            <StyledGridItemLabel item xs={3}>
                                                Entered:
                                            </StyledGridItemLabel>
                                            <StyledGridItem item xs={9}>
                                                {FormatTimestamp(
                                                    data?.created_at,
                                                )}
                                            </StyledGridItem>
                                            <StyledGridItemLabel item xs={3}>
                                                Image ID:
                                            </StyledGridItemLabel>
                                            <StyledGridItem item xs={9}>
                                                {data?.image_id}
                                            </StyledGridItem>
                                            <StyledGridItem item xs={12} sx={{
                                                padding: "8px 0 0 0",
                                                margin: "auto",
                                                width: "100%",
                                                textAlign: "center",
                                                display: "ruby",
                                            }}>
                                                <FvIconCommon image_url={data?.image_url} title={data?.image_id} />
                                            </StyledGridItem>
                                        </>
                                    )}
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                <Grid
                    item
                    xs={12}
                    style={{
                        padding: `${payload.detailLevel > CommonDetailLevel.min ? 8 : 0}px 0 0 0`,
                        margin: "0",
                    }}
                >
                    <Box
                        ref={mapContainerM}
                        style={{
                            minWidth: "240px",
                            maxHeight:
                                payload.detailLevel >
                                    CommonDetailLevel.high
                                    ? "112px"
                                    : payload.detailLevel >
                                        CommonDetailLevel.low
                                        ? "64px"
                                        : "0",
                            minHeight:
                                payload.detailLevel >
                                    CommonDetailLevel.high
                                    ? "112px"
                                    : payload.detailLevel >
                                        CommonDetailLevel.low
                                        ? "64px"
                                        : "0",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#acc7f2",
                            border: `${payload.detailLevel > CommonDetailLevel.low ? 1 : 0}px solid gray`,
                        }}
                    >
                        Microsoft Maps Loading...
                    </Box>
                </Grid>
            </Typography>
        ),
    });
}
