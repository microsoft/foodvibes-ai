import iconScGroup from "@foodvibes/assets/sc_group.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLabelScGroup, KLedgerTypeScGroup } from "@foodvibes/utils/commonConstants";
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
    ScGroupType,
} from "@foodvibes/utils/commonTypes";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function FvCardScGroup({
    data,
    detailLevel = 0,
    isModal = false,
    isTile = false,
    canEdit,
    headerContentCb,
}: {
    data: ScGroupType | null;
    detailLevel?: CommonDetailLevel;
    isModal?: boolean;
    isTile?: boolean;
    canEdit?: boolean;
    headerContentCb?: (payload: CommonCallBack) => JSX.Element;
}) {
    return FvCardCommon({
        iconToUse: iconScGroup,
        idToUse: `Group ${data?.sc_group_id ?? "n/a"}`,
        type: KLedgerTypeScGroup,
        tag: KLabelScGroup,
        title: data?.sc_group_ledger_id
            ? ComposeIdKey(data?.sc_group_ledger_id, data?.sc_group_tx_id)
            : "",
        operationName: data?.operation_name,
        username: data?.username,
        canEdit,
        detailLevel,
        isModal,
        isTile,
        noRibbon: data ? false : true,
        headerContentCb,
        contentCb: (payload: CommonCallBack) => (
            <Typography variant="body2" component="div" color="text.primary">
                {data?.sc_group_ledger_id && payload.detailLevel > CommonDetailLevel.low && (
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <Grid container spacing={0}>
                                <StyledGridItemLabel item xs={3}>
                                    Entered By:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.username}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Description:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.description}
                                </StyledGridItem>
                                {payload.detailLevel > CommonDetailLevel.high && (
                                    <>
                                        <StyledGridItemLabel item xs={3}>
                                            Entered:
                                        </StyledGridItemLabel>
                                        <StyledGridItem item xs={9}>
                                            {FormatTimestamp(data?.created_at)}
                                        </StyledGridItem>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </Typography>
        ),
    });
}
