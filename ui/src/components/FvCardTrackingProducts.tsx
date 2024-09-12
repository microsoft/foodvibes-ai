import { Box, Grid, Typography } from "@mui/material";

import iconTrackingProductsSnapshot from "@foodvibes/assets/tracking-products-snapshot.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLedgerTypeTrackingProducts } from "@foodvibes/utils/commonConstants";
import {
    ComposeIdKey,
    FormatTimestamp,
    GetAggregationIcon,
    GetAggregationLabel,
    GetAggregationLabelColor,
    GetMovementIcon,
    GetMovementLabel,
    GetMovementLabelColor,
} from "@foodvibes/utils/commonFunctions";
import {
    StyledGridItem,
    StyledGridItemLabel,
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonDetailLevel,
    CommonFlag,
    TrackingProductsType,
} from "@foodvibes/utils/commonTypes";

export const RenderFlagEntry = ({
    flagEntry,
    idx,
}: {
    flagEntry: CommonFlag;
    idx: number;
}): JSX.Element => (
    <Box key={`flagEntry${idx}`} className={"flags_container"}>
        <span className={"flags_container spanL"}>
            <img
                src={flagEntry.imageSrc}
                alt={flagEntry.title}
                title={flagEntry.title}
            />
        </span>
        <span
            className={"flags_container spanR"}
            style={{ backgroundColor: flagEntry.bgColor }}
        >
            {flagEntry.title}
        </span>
    </Box>
);
const renderFlagEntries = (flagEntries: CommonFlag[] = []): JSX.Element => {
    const activeFlags: CommonFlag[] = flagEntries?.filter(e => e.imageSrc);

    return (
        <Grid container spacing={0} className={"flags_container_frame"}>
            {activeFlags.map((e, idx) => (
                <StyledGridItem
                    key={`flag${idx}`}
                    item
                    sm={12 / activeFlags.length}
                    xs={12}
                    className={"flags_container_frame"}
                >
                    <RenderFlagEntry flagEntry={e} idx={idx} />
                </StyledGridItem>
            ))}
        </Grid>
    );
};

export default function FvCardTrackingProducts({
    data,
    idx = 0,
    cnt = 0,
    detailLevel = 0,
    isModal = false,
    isTile = false,
}: {
    data: TrackingProductsType | null;
    idx: number;
    cnt: number;
    detailLevel?: CommonDetailLevel;
    isModal?: boolean;
    isTile?: boolean;
}) {
    if (!data) {
        return;
    }

    const iconFlags: CommonFlag[] = [
        {
            imageSrc: GetAggregationIcon(data.product_aggregation),
            title: GetAggregationLabel(data.product_aggregation),
            bgColor: GetAggregationLabelColor(data.product_aggregation),
        },
        {
            imageSrc: GetMovementIcon(data.geotrack_movement),
            title: GetMovementLabel(data.geotrack_movement),
            bgColor: GetMovementLabelColor(data.geotrack_movement),
        },
    ];

    return FvCardCommon({
        iconToUse: iconTrackingProductsSnapshot,
        iconFlags,
        idToUse: FormatTimestamp(data.recorded_at),
        type: KLedgerTypeTrackingProducts,
        tag: `Entry ${cnt - idx} of ${cnt} -- `,
        title: data.tracking_products_ledger_id
            ? ComposeIdKey(
                data.tracking_products_ledger_id,
                data.tracking_products_tx_id,
            ) : "",
        operationName: data?.operation_name,
        username: data?.username,
        detailLevel,
        isModal,
        noRibbon: data ? false : true,
        contentCb: (payload: CommonCallBack) => (
            <Typography variant="body2" component="div" color="text.primary">
                {payload.detailLevel > CommonDetailLevel.low && (
                    <Grid container spacing={0}>
                        <StyledGridItemLabel item xs={3}>
                            Entered By:
                        </StyledGridItemLabel>
                        <StyledGridItem item xs={9}>
                            {data.username}
                        </StyledGridItem>
                        <StyledGridItemLabel item xs={12}>
                            {renderFlagEntries(payload?.iconFlags)}
                        </StyledGridItemLabel>
                        <StyledGridItemLabel item xs={3}>
                            Notes:
                        </StyledGridItemLabel>
                        <StyledGridItem item xs={9} title={data.notes}>
                            {data.notes}
                        </StyledGridItem>
                        <StyledGridItemLabel item xs={3}>
                            Properties:
                        </StyledGridItemLabel>
                        <StyledGridItem item xs={9} title={data.properties}>
                            {data.properties}
                        </StyledGridItem>
                        {payload.detailLevel > CommonDetailLevel.high && (
                            <>
                                <StyledGridItemLabel item xs={3}>
                                    Recorded:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {FormatTimestamp(data.recorded_at)}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Entered:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {FormatTimestamp(data.created_at)}
                                </StyledGridItem>
                            </>
                        )}
                    </Grid>
                )}
            </Typography>
        ),
    });
}
