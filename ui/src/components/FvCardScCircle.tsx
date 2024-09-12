import { Box, Grid, Typography } from "@mui/material";

import iconScCircle from "@foodvibes/assets/sc_circle.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLedgerTypeScCircle } from "@foodvibes/utils/commonConstants";
import {
    ComposeIdKey,
    FormatTimestamp
} from "@foodvibes/utils/commonFunctions";
import {
    StyledGridItem,
    StyledGridItemLabel,
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonDetailLevel,
    CommonFlag,
    ScCircleType,
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

export default function FvCardScCircle({
    data,
    idx = 0,
    cnt = 0,
    detailLevel = 0,
    isModal = false,
    isTile = false,
}: {
    data: ScCircleType | null;
    idx: number;
    cnt: number;
    detailLevel?: CommonDetailLevel;
    isModal?: boolean;
    isTile?: boolean;
}) {
    if (!data) {
        return;
    }

    return FvCardCommon({
        iconToUse: iconScCircle,
        idToUse: `Circle ${data?.sc_group_id ?? "n/a"}`,
        type: KLedgerTypeScCircle,
        tag: `Entry ${cnt - idx} of ${cnt} -- `,
        title: data.sc_circle_ledger_id
            ? ComposeIdKey(
                data.sc_circle_ledger_id,
                data.sc_circle_tx_id,
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
                            Circle Mask:
                        </StyledGridItemLabel>
                        <StyledGridItem item xs={9} title={`${data.active_roles}: ${data.active_roles_long}`}>
                            {data.access_mask} ({data.active_roles})
                        </StyledGridItem>
                        {payload.detailLevel > CommonDetailLevel.high && (
                            <>
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
