import { Geotrack } from "@foodvibes/features/geotrack/Geotrack";
import { FvPermissions } from "@foodvibes/features/permissions/FvPermissions";
import { Product } from "@foodvibes/features/product/Product";
import { ScGroup } from "@foodvibes/features/scGroup/ScGroup";
import { ScUser } from "@foodvibes/features/scUser/ScUser";
import { KLabelGeotrack, KLabelImpersonation, KLabelProduct, KLabelScGroup, KLabelScUser } from "@foodvibes/utils/commonConstants";
import { SubTitle } from "@foodvibes/utils/commonStyles";
import { CommonCardType } from "@foodvibes/utils/commonTypes";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { useMemo } from "react";

export const FvCommonModalPicker = ({
    currActiveCardType,
    readOnly,
    isPickerOpen,
    setPickerOpen,
}: {
    currActiveCardType: CommonCardType | null;
    readOnly: boolean;
    isPickerOpen: boolean;
    setPickerOpen: (payload: boolean) => void;
}) => {
    const titleToUse = useMemo(() => {
        switch (currActiveCardType) {
            case CommonCardType.scGroup:
                return KLabelScGroup;
            case CommonCardType.scUser:
                return KLabelScUser;
            case CommonCardType.geotrack:
                return KLabelGeotrack;
            case CommonCardType.product:
                return KLabelProduct;
            case CommonCardType.impersonation:
                return KLabelImpersonation;
            default:
                return "";
        }
    }, [currActiveCardType]);

    return (
        <Dialog
            fullWidth
            maxWidth="xl"
            open={isPickerOpen}
            onClose={() => {
                setPickerOpen(false);
            }}
            sx={{
                minHeight: "calc(100vh - 0px)",
                maxHeight: "calc(100vh - 0px)",
            }}
        >
            <DialogTitle>
                <SubTitle>
                    Select{" "}
                    {titleToUse}
                </SubTitle>
            </DialogTitle>
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    minHeight: "calc(100vh - 180px)",
                    maxHeight: "calc(100vh - 180px)",
                }}
            >
                {currActiveCardType === CommonCardType.scUser && (
                    <ScUser
                        modalMode={true}
                        readOnly={readOnly}
                        postBookmarkCb={() => {
                            setPickerOpen(false);
                        }}
                    />
                )}
                {currActiveCardType === CommonCardType.scGroup && (
                    <ScGroup
                        modalMode={true}
                        readOnly={readOnly}
                        postBookmarkCb={() => {
                            setPickerOpen(false);
                        }}
                    />
                )}
                {currActiveCardType === CommonCardType.product && (
                    <Product
                        modalMode={true}
                        readOnly={readOnly}
                        postBookmarkCb={() => {
                            setPickerOpen(false);
                        }}
                    />
                )}
                {currActiveCardType === CommonCardType.geotrack && (
                    <Geotrack
                        modalMode={true}
                        readOnly={readOnly}
                        postBookmarkCb={() => {
                            setPickerOpen(false);
                        }}
                    />
                )}
                {currActiveCardType === CommonCardType.impersonation && (
                    <FvPermissions />
                )}
            </DialogContent>
            <DialogActions>
                <IconButton
                    aria-label={`Close contentEdit dialog`}
                    onClick={() => setPickerOpen(false)}
                    size={"small"}
                    color={"primary"}
                >
                    Close
                </IconButton>
            </DialogActions>
        </Dialog>
    )
};
