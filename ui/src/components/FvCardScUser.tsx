import iconScUser from "@foodvibes/assets/sc_user.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLabelScUser, KLedgerTypeScUser } from "@foodvibes/utils/commonConstants";
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
    ScUserType,
} from "@foodvibes/utils/commonTypes";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function FvCardScUser({
    data,
    detailLevel = 0,
    isModal = false,
    isTile = false,
    canEdit,
    headerContentCb,
}: {
    data: ScUserType | null;
    detailLevel?: CommonDetailLevel;
    isModal?: boolean;
    isTile?: boolean;
    canEdit?: boolean;
    headerContentCb?: (payload: CommonCallBack) => JSX.Element;
}) {
    return FvCardCommon({
        iconToUse: iconScUser,
        idToUse: `User ${data?.sc_user_id ?? "n/a"}`,
        type: KLedgerTypeScUser,
        tag: KLabelScUser,
        title: data?.sc_user_ledger_id
            ? ComposeIdKey(data?.sc_user_ledger_id, data?.sc_user_tx_id)
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
                {data?.sc_user_ledger_id && payload.detailLevel > CommonDetailLevel.low && (
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
                                    Email Address:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.email_addr}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Phone:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.phone}
                                </StyledGridItem>
                                {payload.detailLevel > CommonDetailLevel.high && (
                                    <>
                                        <StyledGridItemLabel item xs={3}>
                                            Non-Circle Mask:
                                        </StyledGridItemLabel>
                                        <StyledGridItem item xs={9} title={`${data?.active_roles}: ${data?.active_roles_long}`}>
                                            {data?.access_mask} ({data?.active_roles})
                                        </StyledGridItem>
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
