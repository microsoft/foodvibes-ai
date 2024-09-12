import { TrackingProducts } from "@foodvibes/features/trackingProducts/TrackingProducts";
import { QueryParamsInit } from "@foodvibes/utils/commonFunctions";
import {
    IconButtonNonSave,
    StyledHistoryPoints,
    StyledHistoryPointsSubtitle,
    SubTitle
} from "@foodvibes/utils/commonStyles";
import { QueryParamsType } from "@foodvibes/utils/commonTypes";
import CloseIcon from "@mui/icons-material/Close";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid
} from "@mui/material";

export const FvTrackingProductsLookupModal = ({
    selectTrackingProducts,
    label,
    title,
    ledgerId,
    isModalOpenTrackingProductsHistory,
    setModalOpenTrackingProductsHistory,
    setCenterCycle,
    setLastId,
}: {
    selectTrackingProducts: (queryParams: QueryParamsType) => void;
    label: string;
    title: string;
    ledgerId: number;
    isModalOpenTrackingProductsHistory: boolean;
    setModalOpenTrackingProductsHistory: (payload: boolean) => void;
    setCenterCycle: (on: boolean) => void;
    setLastId: (lastId: number) => void;
}) => {
    const exitActions = async () => {
        setCenterCycle(false);
        setLastId(0);
        setModalOpenTrackingProductsHistory(false);
        selectTrackingProducts(QueryParamsInit({}));
    }

    return <Dialog
        fullWidth
        maxWidth="xl"
        open={isModalOpenTrackingProductsHistory}
        onClose={async () => {
            await exitActions();
        }}
        sx={{
            minHeight: "calc(100vh - 0px)",
            maxHeight: "calc(100vh - 0px)",
        }}
    >
        <DialogTitle>
            <SubTitle sx={{
                maxHeight: "34px",
                minHeight: "34px",
            }}>
                <Grid component="span" container spacing={0}>
                    <Grid component="span" item xs={12}>
                        <StyledHistoryPoints>
                            {title}
                        </StyledHistoryPoints>
                        {" "}Links to Tracking Products
                    </Grid>
                    <Grid component="span" item xs={12}>
                        <StyledHistoryPointsSubtitle>
                            {label} Ledger ID {ledgerId}
                        </StyledHistoryPointsSubtitle>
                    </Grid>
                </Grid>
            </SubTitle>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TrackingProducts modalMode={true} readOnly={true} />
        </DialogContent>
        <DialogActions>
            <IconButtonNonSave
                sx={{ mr: 2 }}
                title="Close history"
                onClick={async () => {
                    await exitActions();
                }}
                size={"small"}
            >
                <CloseIcon />
            </IconButtonNonSave>
        </DialogActions>
    </Dialog>;
};
