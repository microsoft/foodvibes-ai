
import iconTrackingProducts from "@foodvibes/assets/tracking-products.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import FvTrackingProductsEntryTile from "@foodvibes/components/FvTrackingProductsEntryTile";
import { KLabelTrackingProducts } from "@foodvibes/utils/commonConstants";
import { ComposeIdKey } from "@foodvibes/utils/commonFunctions";
import {
    CommonCallBack,
    CommonDetailLevel,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";
import { Box, Grid } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

export default function FvTrackingProductsLedger({
    data, // data is in descending order of tracking_products_tx_id value
    trackingProductsRankToView,
    isModal,
    detailLevel,
    setDetailLevel,
    mapsEngineIsReady,
    isAutoHeight,
    noHeader,
    noBody,
    bannerHeight,
}: {
    data: TrackingProductsType[];
    trackingProductsRankToView: number;
    isModal: boolean;
    detailLevel: CommonDetailLevel;
    setDetailLevel: (detailLevel: CommonDetailLevel) => void;
    mapsEngineIsReady: boolean | null;
    isAutoHeight: boolean;
    noHeader?: boolean;
    noBody?: boolean;
    bannerHeight: number;
}): JSX.Element | undefined {
    if (!data?.length) {
        return;
    }

    const scrollToRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const heightValue: string = isAutoHeight ? "auto" : `calc(100vh - ${bannerHeight}px)`;
    const latestRow = useMemo<TrackingProductsType | null>(
        () => (data?.length ? data[0] : null),
        [data],
    );

    useEffect(() => {
        if (isModal && scrollToRef?.current) {
            (scrollToRef.current as HTMLElement).scrollIntoView({
                behavior: "instant",
            });
        }
    }, [isModal, scrollToRef?.current]);

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
        noHeader,
        noBody,
        noRibbon: data ? false : true,
        setDetailLevel,
        contentCb: noBody
            ? null
            : (payload: CommonCallBack) =>
                <Box
                    sx={{
                        maxHeight: heightValue,
                        minHeight: heightValue,
                        overflow: "auto",
                    }}
                >
                    {data.map((rec: TrackingProductsType, idx) => (
                        <Box key={`trackingProducts${idx}`}>
                            {idx > 0 && (
                                <Grid
                                    item
                                    xs={12}
                                    sx={{
                                        padding: 0,
                                        margin: 0,
                                        height: "auto",
                                    }}
                                >
                                    <svg id="triangle" viewBox="0 0 100 2">
                                        <polygon
                                            points="50 0, 55 2, 45 2"
                                            fill="purple"
                                        />
                                    </svg>
                                </Grid>
                            )}

                            <FvTrackingProductsEntryTile
                                rec={data[idx]}
                                cnt={data.length}
                                idx={idx}
                                trackingProductsRankToView={trackingProductsRankToView}
                                isModal={isModal}
                                isTile={false}
                                detailLevel={payload.detailLevel}
                                mapsEngineIsReady={mapsEngineIsReady}
                                scrollToRef={scrollToRef}
                            />
                        </Box>
                    ))}
                </Box>

    });
}
