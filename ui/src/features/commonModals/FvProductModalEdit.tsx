import iconProduct from "@foodvibes/assets/product.png";
import FvCardProduct from "@foodvibes/components/FvCardProduct";
import { FvDialogActionsCommon } from "@foodvibes/components/FvDialogActionsCommon";
import { GetDialogTitle } from "@foodvibes/components/FvDialogCommon";
import { FvEditFieldCommon } from "@foodvibes/components/FvEditFieldCommon";
import { FvIconCommon } from "@foodvibes/components/FvIconCommon";
import { FvUploadCommon } from "@foodvibes/components/FvUploadCommon";
import { KLabelProduct } from "@foodvibes/utils/commonConstants";
import {
    CommonDetailLevel,
    CommonEditFieldType,
    EditFieldsType,
    ProductType,
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

export const FvProductModalEdit = ({
    bookmarkedProduct,
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
    bookmarkedProduct: ProductType | null;
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
    const disabledSave: boolean = (editFields?.incoming?.product_id ?? "").toString().trim().length === 0 || isClean;
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
                `${bookmarkedProduct?.product_ledger_id ? "Update" : "Create New"} `,
                iconProduct,
                `${KLabelProduct} ${bookmarkedProduct?.product_ledger_id ? `${bookmarkedProduct?.product_ledger_id}` : "Entry"} `,
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
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"product_id"} label={"Product ID"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"description"} label={"Description"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item xs={6}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"quantity"} label={"Quantity"} type={CommonEditFieldType.number} />
                            </Grid>
                            <Grid item xs={6}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"storage_tier"} label={"Storage Tier"} type={CommonEditFieldType.number} />
                            </Grid>
                            <Grid item lg={8} md={7} sm={5} xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"properties"} label={"Properties"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item lg={4} md={5} sm={7} xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"recorded_at"} label={"Recorded at"} type={CommonEditFieldType.datepicker} />
                            </Grid>
                            <Grid item xs={2} sx={{ margin: "14px 0 0 12px" }}>
                                <FvIconCommon image_url={editFields?.incoming?.image_url} title={bookmarkedProduct?.image_id} />
                            </Grid>
                            <Grid item xs>
                                <FvUploadCommon
                                    image_url={editFields?.incoming?.image_url ?? ''}
                                    setEditFields={setEditFields}
                                    uploadImage={uploadImage}
                                    isProduct={true}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    {editFields?.current?.product_id ?
                        <Grid item
                            xs={12}
                            sx={{
                                paddingTop: '12px',
                            }}
                        >
                            <FvCardProduct
                                data={bookmarkedProduct}
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
