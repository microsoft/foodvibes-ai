
import iconScCircle from "@foodvibes/assets/tracking-products.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import FvScCircleEntryTile from "@foodvibes/components/FvScCircleEntryTile";
import { KLabelScCircle } from "@foodvibes/utils/commonConstants";
import {
    CommonCallBack,
    CommonDetailLevel,
    ScCircleType,
} from "@foodvibes/utils/commonTypes";
import { Box } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

export default function FvScCircleLedger({
    data, // data is in descending order of tracking_products_tx_id value
    isModal,
    detailLevel,
    setDetailLevel,
    isAutoHeight,
    noHeader,
    noBody,
    bannerHeight,
}: {
    data: ScCircleType[];
    isModal: boolean;
    detailLevel: CommonDetailLevel;
    setDetailLevel: (detailLevel: CommonDetailLevel) => void;
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
    const latestRow = useMemo<ScCircleType | null>(
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
        iconToUse: iconScCircle,
        idToUse: "",
        tag: KLabelScCircle,
        title: "Members",
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
                    {data.map((rec: ScCircleType, idx) => (
                        <Box key={`scCircle${idx}`}>
                            <FvScCircleEntryTile
                                rec={data[idx]}
                                cnt={data.length}
                                idx={idx}
                                ledgerIdToView={latestRow?.sc_circle_ledger_id ?? 0}
                                isModal={isModal}
                                isTile={false}
                                detailLevel={payload.detailLevel}
                                scrollToRef={scrollToRef}
                            />
                        </Box>
                    ))}
                </Box>

    });
}
