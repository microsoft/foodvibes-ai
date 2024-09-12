import iconScUser from "@foodvibes/assets/sc_user.png";
import FvCardScUser from "@foodvibes/components/FvCardScUser";
import { FvDialogActionsCommon } from "@foodvibes/components/FvDialogActionsCommon";
import { GetDialogTitle } from "@foodvibes/components/FvDialogCommon";
import { FvEditFieldCommon } from "@foodvibes/components/FvEditFieldCommon";
import { FvScDropdownRoles } from "@foodvibes/components/FvScDropdownRoles";
import { KLabelScUser } from "@foodvibes/utils/commonConstants";
import {
    CommonDetailLevel,
    CommonEditFieldType,
    EditFieldsType,
    ScUserType,
    UploadImageType
} from "@foodvibes/utils/commonTypes";
import {
    Dialog,
    DialogActions,
    DialogContent,
    Grid
} from "@mui/material";
import { useEffect, useState } from "react";

const heightValue: string = "calc(100vh - 192px)";

export const FvScUserModalEdit = ({
    bookmarkedScUser,
    editFields,
    isClean,
    isEditorOpen,
    uploadedFileUrl,
    setEditFields,
    setEditorOpen,
    upsert,
    uploadedFileUrlReset,
    uploadImage
}: {
    bookmarkedScUser: ScUserType | null;
    editFields: EditFieldsType | null;
    isClean: boolean;
    isEditorOpen: boolean;
    uploadedFileUrl: string | null;
    setEditFields: (payload: EditFieldsType | null) => void;
    setEditorOpen: (payload: boolean) => void;
    upsert: (keepEditorOpenNew: boolean, saveAsNew?: boolean) => void;
    uploadedFileUrlReset: () => void;
    uploadImage: (uploadImage: UploadImageType) => void;
}) => {
    const [topGridPosition, setTopGridPosition] = useState<string>("relative");
    const disabledSave: boolean = isClean;
    const updateDimensions = () => {
        setTopGridPosition(window.innerWidth >= 600 ? "sticky" : "relative");
    };
    useEffect(() => {
        if (uploadedFileUrl) {
            setEditFields({
                incoming: {
                    image_url: uploadedFileUrl,
                },
            });
            uploadedFileUrlReset();
        }
    }, [uploadedFileUrl]);
    useEffect(() => {
        // Test via a getter in the options object to see if the passive property is accessed
        let supportsPassive = false;
        try {
            let opts = Object.defineProperty({}, "passive", {
                get: () => {
                    supportsPassive = true;

                    return true;
                },
            });
            window.addEventListener("testPassive", () => null, opts);
            window.removeEventListener("testPassive", () => null, opts);
        } catch (e) { /* empty */ }

        // Use our detect's results. passive applied if supported, capture will be false either way.
        window.addEventListener(
            "resize",
            updateDimensions,
            supportsPassive ? { passive: true } : false,
        );
        updateDimensions();

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return (
        <Dialog fullWidth maxWidth="xl" open={isEditorOpen} onClose={() => { setEditorOpen(false); }}>
            {GetDialogTitle(
                `${bookmarkedScUser?.sc_user_ledger_id ? "Update" : "Create New"} `,
                iconScUser,
                `${KLabelScUser} ${bookmarkedScUser?.sc_user_ledger_id ? `${bookmarkedScUser?.sc_user_ledger_id}` : "Entry"} `,
            )}
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    minHeight: heightValue,
                    maxHeight: heightValue,
                }}
            >
                <Grid container spacing={0}>
                    <Grid item
                        xs={12}
                        sx={{
                            position: topGridPosition,
                            top: 0,
                            backgroundColor: "white",
                            // paddingTop: '40px',
                            // paddingBottom: '40px',
                            zIndex: 999,
                        }}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"sc_user_id"} label={"User ID"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"email_addr"} label={"Email Address"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item xs={6}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"phone"} label={"Phone"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item xs={12}>
                                <FvScDropdownRoles editFields={editFields} setEditFields={setEditFields} />
                            </Grid>
                        </Grid>
                    </Grid>
                    {editFields?.current?.sc_user_ledger_id ?
                        <Grid item
                            xs={12}
                            sx={{
                                paddingTop: '12px',
                            }}
                        >
                            <FvCardScUser
                                data={bookmarkedScUser}
                                detailLevel={CommonDetailLevel.max}
                                isModal={false}
                                isTile={false}
                            />
                        </Grid>
                        : null}
                </Grid>
            </DialogContent>
            <DialogActions>
                <FvDialogActionsCommon disabledSave={disabledSave} setEditorOpen={setEditorOpen} upsert={upsert} canDoSaveAs />
            </DialogActions>
        </Dialog>
    );
};
