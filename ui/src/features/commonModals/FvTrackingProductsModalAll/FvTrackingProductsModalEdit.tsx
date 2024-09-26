import iconTrackingProducts from "@foodvibes/assets/tracking-products.png";
import FvCardGeotrack from "@foodvibes/components/FvCardGeotrack";
import FvCardProduct from "@foodvibes/components/FvCardProduct";
import { RenderFlagEntry } from "@foodvibes/components/FvCardTrackingProducts";
import { FvDialogActionsCommon } from "@foodvibes/components/FvDialogActionsCommon";
import { GetDialogTitle } from "@foodvibes/components/FvDialogCommon";
import { FvEditFieldCommon } from "@foodvibes/components/FvEditFieldCommon";
import { KLabelTrackingProducts } from "@foodvibes/utils/commonConstants";
import {
    GetAggregationIcon,
    GetAggregationLabel,
    GetAggregationLabelColor
} from "@foodvibes/utils/commonFunctions";
import {
    IconButtonAddReplace,
    StyledRequiredLabel
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonCardType,
    CommonDetailLevel,
    CommonEditFieldType,
    CommonFlag,
    EditFieldsPayloadType,
    EditFieldsType,
    GeotrackType,
    ProductType,
    TrackingProductsType
} from "@foodvibes/utils/commonTypes";
import InfoIcon from "@mui/icons-material/Info";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import FvTrackingProductsLedger from "./history/tabs/FvTrackingProductsLedger";

const heightValue: string = "calc(100vh - 192px)";
const InstructionsHeader = ({
    isCreate,
}: {
    isCreate?: boolean;
}): JSX.Element => <>{isCreate ? "The initial" : "The next"} ledger entry</>;
const InstructionsSuffix = ({
    swappedProduct,
}: {
    swappedProduct?: boolean;
}): JSX.Element => (
    <>
        may have its{" "}
        {swappedProduct ? (
            <>
                <b>Aggregation/Disaggregation</b>,{" "}
            </>
        ) : (
            <></>
        )}
        <b>Properties</b> and/or <b>Recorded at</b> fields specified.
    </>
);
const Instructions = ({
    isCreate,
    pickedProduct,
    pickedGeotrack,
    swappedProduct,
    swappedGeotrack,
}: {
    isCreate?: boolean;
    pickedProduct?: boolean;
    pickedGeotrack?: boolean;
    swappedProduct?: boolean;
    swappedGeotrack?: boolean;
}): JSX.Element => {
    if (isCreate) {
        if (pickedProduct && pickedGeotrack) {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} />{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        } else if (pickedProduct) {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} /> must have its{" "}
                    <b>Geotrack</b> specified and{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        } else if (pickedGeotrack) {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} /> must have its{" "}
                    <b>Product</b> specified and{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        } else {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} /> must have both
                    its <b>Product</b> and <b>Geotrack</b> specified and{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        }
    } else {
        if (pickedProduct && pickedGeotrack) {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} />{" "}
                    {swappedProduct || swappedGeotrack ? (
                        <></>
                    ) : (
                        <>
                            may have either its <b>Product</b> or{" "}
                            <b>Geotrack</b> replaced <b><Box component="span" sx={{ 'color': 'red' }}>but not both</Box></b> and{" "}
                        </>
                    )}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        } else if (pickedProduct) {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} /> must have its{" "}
                    <b>Geotrack</b> specified and{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        } else if (pickedGeotrack) {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} /> must have its{" "}
                    <b>Product</b> specified and{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        } else {
            return (
                <>
                    <InstructionsHeader isCreate={isCreate} /> must have either
                    its <b>Product</b> and <b>Geotrack</b> specified{" "}
                    <b>but not both in the same entry</b> and{" "}
                    <InstructionsSuffix swappedProduct={swappedProduct} />
                </>
            );
        }
    }
};
const InstructionsBox = (contentCb: () => JSX.Element) => (
    <Box
        sx={{
            color: "navy",
            fontSize: "0.8rem",
            fontWeight: "normal",
            backgroundColor: "lightyellow",
            textAlign: "left",
            border: "0.5px solid gray",
            display: "block",
            padding: "2px 8px 4px",
            marginTop: "12px",
        }}
    >
        <table>
            <tbody>
                <tr>
                    <td>
                        <div style={{}}>
                            <InfoIcon />
                        </div>
                    </td>
                    <td>
                        {contentCb()}
                    </td>
                </tr>
            </tbody>
        </table>
    </Box>
);
export const FvTrackingProductsModalEdit = ({
    bookmarkedGeotrack,
    bookmarkedProduct,
    isClean,
    data,
    detailLevelB,
    editFields,
    isEditorOpen,
    mapsEngineIsReady,
    setActiveCardType,
    setDetailLevelB,
    setEditFields,
    setEditorOpen,
    setPickerOpen,
    report,
    upsert,
    bannerHeight,
}: {
    bookmarkedGeotrack: GeotrackType | null;
    bookmarkedProduct: ProductType | null;
    isClean: boolean | null;
    data: TrackingProductsType[];
    detailLevelB: CommonDetailLevel;
    editFields: EditFieldsType | null;
    isEditorOpen: boolean;
    mapsEngineIsReady: boolean | null;
    setActiveCardType: (payload: CommonCardType) => void;
    setDetailLevelB: (detailLevel: CommonDetailLevel) => void;
    setEditFields: (payload: EditFieldsType | null) => void;
    setEditorOpen: (payload: boolean) => void;
    setPickerOpen: (payload: boolean) => void;
    report: (row: TrackingProductsType | null, ledgerId?: number) => void;
    upsert: (keepEditorOpenNew: boolean, saveAsNew?: boolean) => void;
    bannerHeight: number;
}) => {
    const iconFlags: CommonFlag[] = useMemo<CommonFlag[]>(() => {
        return [
            {
                imageSrc: GetAggregationIcon(1),
                title: GetAggregationLabel(1),
                bgColor: GetAggregationLabelColor(1),
            },
            {
                imageSrc: GetAggregationIcon(-1),
                title: GetAggregationLabel(-1),
                bgColor: GetAggregationLabelColor(-1),
            },
        ];
    }, []);
    const isCreate: boolean = !editFields?.current?.tracking_products_ledger_id;
    const pickedProduct: boolean = !!editFields?.current?.product_ledger_id;
    const pickedGeotrack: boolean = !!editFields?.current?.geotrack_ledger_id;

    const [swappedProduct, setSwappedProduct] = useState<boolean>(false);
    const [swappedGeotrack, setSwappedGeotrack] = useState<boolean>(false);
    const [topGridPosition, setTopGridPosition] = useState<string>("relative");
    const [disabledSave, setDisabledSave] = useState<boolean>(false);

    useEffect(() => {
        const haveSwappedProduct: boolean = pickedProduct &&
            bookmarkedProduct?.product_ledger_id !== editFields?.current?.product_ledger_id &&
            bookmarkedProduct?.product_tx_id !== editFields?.current?.product_tx_id;
        let newProductAggregation: number = editFields?.current?.product_aggregation ?? 0;

        if (haveSwappedProduct) {
            if (swappedGeotrack) {
                newProductAggregation = 0;
            } else {
                const storageTierOrig: number = editFields?.current?.storage_tier ?? 0;
                const storageTierNew: number = bookmarkedProduct?.storage_tier ?? 0;

                newProductAggregation =
                    storageTierNew > storageTierOrig
                        ? 1
                        : storageTierNew < storageTierOrig
                            ? -1
                            : 0;
            }
        }

        setSwappedProduct(haveSwappedProduct);
        setEditFields({
            incoming: {
                product_ledger_id: bookmarkedProduct?.product_ledger_id,
                product_tx_id: bookmarkedProduct?.product_tx_id,
                product_aggregation: newProductAggregation,
                storage_tier: bookmarkedProduct?.storage_tier,
            }
        } as EditFieldsType);
    }, [bookmarkedProduct?.product_ledger_id, bookmarkedProduct?.product_tx_id, editFields?.current?.product_ledger_id, editFields?.current?.product_tx_id]);
    useEffect(() => {
        const swappedGeotrackNew: boolean = pickedGeotrack &&
            bookmarkedGeotrack?.geotrack_ledger_id !== editFields?.current?.geotrack_ledger_id &&
            bookmarkedGeotrack?.geotrack_tx_id !== editFields?.current?.geotrack_tx_id;
        const editFieldsIncoming: EditFieldsPayloadType = {
            geotrack_ledger_id: bookmarkedGeotrack?.geotrack_ledger_id,
            geotrack_tx_id: bookmarkedGeotrack?.geotrack_tx_id,
        };

        if (swappedGeotrackNew) {
            editFieldsIncoming.product_aggregation = 0; // reset aggregation/disaggregation when geotrack is swapped
        }

        setSwappedGeotrack(swappedGeotrackNew);
        setEditFields({
            incoming: editFieldsIncoming
        } as EditFieldsType);
    }, [bookmarkedGeotrack?.geotrack_ledger_id, bookmarkedGeotrack?.geotrack_tx_id, editFields?.current?.geotrack_ledger_id, editFields?.current?.geotrack_tx_id]);
    useEffect(() => {
        setDisabledSave(
            !!isClean && (
                isCreate && !!editFields?.incoming?.product_ledger_id && !!editFields?.incoming?.geotrack_ledger_id ||
                !isCreate && pickedProduct && pickedGeotrack && !(swappedProduct || swappedGeotrack)
            )
        );

        if (isCreate) {
            return;
        }
    }, [isCreate, pickedProduct, pickedGeotrack, isClean,]);
    const updateDimensions = () => {
        setTopGridPosition(window.innerWidth >= 600 ? "sticky" : "relative");
    };
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
    const setProductAggregation = (productAggregation: number) => {
        setEditFields({
            incoming: {
                product_aggregation: productAggregation,
            }
        } as EditFieldsType);
    };

    return (
        <Dialog
            fullWidth
            maxWidth="xl"
            open={isEditorOpen}
            onClose={() => {
                setEditorOpen(false);
            }}
        >
            {GetDialogTitle(
                `${editFields?.current?.tracking_products_ledger_id ? "Update" : "Create New"} `,
                iconTrackingProducts,
                `${KLabelTrackingProducts} ${editFields?.current?.tracking_products_ledger_id ? `${editFields?.current?.tracking_products_ledger_id}` : "Entry"} `,
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
                    <Grid
                        item
                        xs={12}
                        sx={{
                            position: topGridPosition,
                            top: 0,
                            backgroundColor: "white",
                            zIndex: 999,
                        }}
                    >
                        <Grid container spacing={1}>
                            <Grid item lg={4} md={5} sm={5} xs={12}>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                        <FvCardProduct
                                            data={
                                                bookmarkedProduct as ProductType
                                            }
                                            detailLevel={CommonDetailLevel.max}
                                            headerContentCb={(
                                                payload: CommonCallBack,
                                            ) => (
                                                <>
                                                    <IconButtonAddReplace
                                                        size="small"
                                                        edge="start"
                                                        color="inherit"
                                                        aria-label="action"
                                                        sx={{ mr: 1 }}
                                                        id="action-button"
                                                        aria-haspopup="false"
                                                        disabled={
                                                            swappedGeotrack
                                                        }
                                                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                                            event.preventDefault();

                                                            if (!swappedGeotrack) {
                                                                setActiveCardType(
                                                                    CommonCardType.product,
                                                                );
                                                                setPickerOpen(true);
                                                            }
                                                        }}
                                                        title={bookmarkedProduct?.product_ledger_id ? `Replace ${payload.tag} ${payload.title}` : "Add New Entry"}
                                                    >
                                                        {bookmarkedProduct?.product_id
                                                            ? "Replace"
                                                            : `Add New ${payload.tag}`}
                                                    </IconButtonAddReplace>
                                                    {bookmarkedProduct?.product_id ? (
                                                        `${payload.tag} ${payload.title}`
                                                    ) : (
                                                        <StyledRequiredLabel component="span">
                                                            Required
                                                        </StyledRequiredLabel>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </Grid>
                                    {!isCreate && (
                                        <>
                                            <Grid item xs={12}>
                                                {InstructionsBox(() =>
                                                    <Box component="span">
                                                        {
                                                            swappedProduct ?
                                                                <>
                                                                    Storage Tier:{' '}
                                                                    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                                                                        <b>Current={editFields?.current?.storage_tier}</b>{' '}vs{' '}
                                                                        <b>Incoming={editFields?.incoming?.storage_tier}</b>
                                                                    </Box>
                                                                </> : <>
                                                                    Optionally override <b>Aggregation</b>/<b>Disaggregation</b>
                                                                </>
                                                        }
                                                    </Box>
                                                )}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <RadioGroup
                                                    sx={{ marginTop: "6px" }}
                                                    title={
                                                        swappedProduct
                                                            ? "Override Aggregation/Disaggregation for replaced product"
                                                            : "Aggregation/Disaggregation may be specified after product is replaced"
                                                    }
                                                    aria-labelledby="demo-radio-buttons-group-label"
                                                    value={editFields?.incoming?.product_aggregation ?? 0}
                                                    name="radio-buttons-group"
                                                    onChange={(
                                                        event: React.ChangeEvent<HTMLInputElement>,
                                                    ) => {
                                                        const productAggregation: number = Number((event.target as HTMLInputElement).value)

                                                        setProductAggregation(productAggregation);
                                                    }}
                                                >
                                                    <Grid container spacing={0}>
                                                        <Grid item xl={6} xs={12}>
                                                            <FormControlLabel
                                                                disabled={
                                                                    swappedGeotrack
                                                                }
                                                                value={1}
                                                                control={<Radio />}
                                                                label={
                                                                    <RenderFlagEntry
                                                                        flagEntry={
                                                                            iconFlags[0]
                                                                        }
                                                                        idx={0}
                                                                    />
                                                                }
                                                            />
                                                        </Grid>
                                                        <Grid item lg={6} xs={12}>
                                                            <FormControlLabel
                                                                disabled={
                                                                    swappedGeotrack
                                                                }
                                                                value={-1}
                                                                control={<Radio />}
                                                                label={
                                                                    <RenderFlagEntry
                                                                        flagEntry={
                                                                            iconFlags[1]
                                                                        }
                                                                        idx={1}
                                                                    />
                                                                }
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </RadioGroup>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                            <Grid item lg={8} md={7} sm={7} xs={12}>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                        <FvCardGeotrack
                                            data={
                                                bookmarkedGeotrack as GeotrackType
                                            }
                                            detailLevel={CommonDetailLevel.max}
                                            headerContentCb={(
                                                payload: CommonCallBack,
                                            ) => (
                                                <>
                                                    <IconButtonAddReplace
                                                        size="small"
                                                        edge="start"
                                                        color="inherit"
                                                        aria-label="action"
                                                        sx={{ mr: 1 }}
                                                        id="action-button"
                                                        aria-haspopup="false"
                                                        disabled={
                                                            swappedProduct
                                                        }
                                                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                                            event.preventDefault();

                                                            if (!swappedProduct) {
                                                                setActiveCardType(
                                                                    CommonCardType.geotrack,
                                                                );
                                                                setPickerOpen(true);
                                                            }
                                                        }}
                                                        title={bookmarkedGeotrack?.geotrack_ledger_id ? `Replace ${payload.tag} ${payload.title}` : "Add New Entry"}
                                                    >
                                                        {bookmarkedGeotrack?.geotrack_id
                                                            ? "Replace"
                                                            : `Add New ${payload.tag}`}
                                                    </IconButtonAddReplace>
                                                    {bookmarkedGeotrack?.geotrack_id ? (
                                                        `${payload.tag} ${payload.title}`
                                                    ) : (
                                                        <StyledRequiredLabel component="span">
                                                            Required
                                                        </StyledRequiredLabel>
                                                    )}
                                                </>
                                            )}
                                            mapsEngineIsReady={
                                                mapsEngineIsReady
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"notes"} label={"notes"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item lg={8} md={7} sm={5} xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"properties"} label={"Properties"} type={CommonEditFieldType.text} />
                            </Grid>
                            <Grid item lg={4} md={5} sm={7} xs={12}>
                                <FvEditFieldCommon editFields={editFields} setEditFields={setEditFields} id={"recorded_at"} label={"Recorded at"} type={CommonEditFieldType.datepicker} />
                            </Grid>
                            <Grid item xs={12}>
                                {InstructionsBox(() => <Instructions
                                    isCreate={isCreate} pickedProduct={pickedProduct} pickedGeotrack={pickedGeotrack} swappedProduct={swappedProduct} swappedGeotrack={swappedGeotrack} />)}
                            </Grid>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            sx={{
                                marginTop: 1,
                                zIndex: 888,
                            }}
                        >
                            <FvTrackingProductsLedger
                                data={data}
                                trackingProductsRankToView={-1}
                                isModal={false}
                                detailLevel={detailLevelB}
                                setDetailLevel={setDetailLevelB}
                                mapsEngineIsReady={mapsEngineIsReady}
                                isAutoHeight={true}
                                noBody
                                bannerHeight={bannerHeight}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sx={{
                            marginTop: 0,
                            zIndex: 888,
                        }}
                    >
                        <FvTrackingProductsLedger
                            data={data}
                            trackingProductsRankToView={-1}
                            isModal={false}
                            detailLevel={detailLevelB}
                            setDetailLevel={setDetailLevelB}
                            mapsEngineIsReady={mapsEngineIsReady}
                            isAutoHeight={true}
                            noHeader
                            bannerHeight={bannerHeight}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <FvDialogActionsCommon
                    disabledSave={disabledSave}
                    setEditorOpen={setEditorOpen}
                    upsert={upsert} report={report}
                    ledgerId={editFields?.current?.tracking_products_ledger_id}
                    canDoSaveAs
                />
            </DialogActions>
        </Dialog>
    );
};
