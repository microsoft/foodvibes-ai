import iconProduct from "@foodvibes/assets/product.png";
import { FvCardCommon } from "@foodvibes/components/FvCardCommon";
import { KLabelProduct, KLedgerTypeProduct } from "@foodvibes/utils/commonConstants";
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
    ProductType,
} from "@foodvibes/utils/commonTypes";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { FvIconCommon } from "./FvIconCommon";

export default function FvCardProduct({
    data,
    detailLevel = 0,
    isModal = false,
    isTile = false,
    canEdit,
    headerContentCb,
}: {
    data: ProductType | null;
    detailLevel?: CommonDetailLevel;
    isModal?: boolean;
    isTile?: boolean;
    canEdit?: boolean;
    headerContentCb?: (payload: CommonCallBack) => JSX.Element;
}) {
    return FvCardCommon({
        iconToUse: iconProduct,
        idToUse: data?.product_id,
        type: KLedgerTypeProduct,
        tag: KLabelProduct,
        title: data?.product_ledger_id
            ? ComposeIdKey(data?.product_ledger_id, data?.product_tx_id)
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
                {data?.product_id && payload.detailLevel > CommonDetailLevel.low && (
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
                                    Quantity:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.quantity}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Storage Tier:
                                </StyledGridItemLabel>
                                <StyledGridItem item xs={9}>
                                    {data?.storage_tier}
                                </StyledGridItem>
                                <StyledGridItemLabel item xs={3}>
                                    Description:
                                </StyledGridItemLabel>
                                <StyledGridItem
                                    item
                                    xs={9}
                                    title={data?.description}
                                >
                                    {data?.description}
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
                                {payload.detailLevel > CommonDetailLevel.high && (
                                    <>
                                        <StyledGridItemLabel item xs={3}>
                                            Recorded:
                                        </StyledGridItemLabel>
                                        <StyledGridItem item xs={9}>
                                            {FormatTimestamp(data?.recorded_at)}
                                        </StyledGridItem>
                                        <StyledGridItemLabel item xs={3}>
                                            Entered:
                                        </StyledGridItemLabel>
                                        <StyledGridItem item xs={9}>
                                            {FormatTimestamp(data?.created_at)}
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
            </Typography>
        ),
    });
}
