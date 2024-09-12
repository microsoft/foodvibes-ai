import iconScGroup from "@foodvibes/assets/sc_group.png";
import FvCardScGroup from "@foodvibes/components/FvCardScGroup";
import { FvDialogActionsCommon } from "@foodvibes/components/FvDialogActionsCommon";
import { GetDialogTitle } from "@foodvibes/components/FvDialogCommon";
import { FvEditFieldCommon } from "@foodvibes/components/FvEditFieldCommon";
import { KLabelScGroup } from "@foodvibes/utils/commonConstants";
import {
    CommonDetailLevel,
    CommonEditFieldType,
    EditFieldsType,
    ScGroupType,
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

export const FvScGroupModalEdit = ({
    bookmarkedScGroup,
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
    bookmarkedScGroup: ScGroupType | null;
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
                `${bookmarkedScGroup?.sc_group_ledger_id ? "Update" : "Create New"} `,
                iconScGroup,
                `${KLabelScGroup} ${bookmarkedScGroup?.sc_group_ledger_id ? `${bookmarkedScGroup?.sc_group_ledger_id}` : "Entry"} `,
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
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"sc_group_id"} label={"Group ID"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"description"} label={"Description"} type={CommonEditFieldType.text} />
                            </Grid>
                        </Grid>
                    </Grid>
                    {editFields?.current?.sc_group_ledger_id ?
                        <Grid item
                            xs={12}
                            sx={{
                                paddingTop: '12px',
                            }}
                        >
                            <FvCardScGroup
                                data={bookmarkedScGroup}
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
