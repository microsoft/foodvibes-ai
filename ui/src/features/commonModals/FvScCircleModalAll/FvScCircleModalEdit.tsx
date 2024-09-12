import iconscCircle from "@foodvibes/assets/sc_circle.png";
import FvCardScGroup from "@foodvibes/components/FvCardScGroup";
import FvCardScUser from "@foodvibes/components/FvCardScUser";
import { FvDialogActionsCommon } from "@foodvibes/components/FvDialogActionsCommon";
import { GetDialogTitle } from "@foodvibes/components/FvDialogCommon";
import { FvScDropdownRoles } from "@foodvibes/components/FvScDropdownRoles";
import { KLabelScCircle } from "@foodvibes/utils/commonConstants";
import {
    IconButtonAddReplace,
    StyledRequiredLabel
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonCardType,
    CommonDetailLevel,
    EditFieldsType,
    ScCircleType,
    ScGroupType,
    ScUserType
} from "@foodvibes/utils/commonTypes";
import {
    Dialog,
    DialogActions,
    DialogContent,
    Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import FvScCircleLedger from "./FvScCircleLedger";

const heightValue: string = "calc(100vh - 192px)";
export const FvScCircleModalEdit = ({
    bookmarkedScGroup,
    bookmarkedScUser,
    isClean,
    data,
    detailLevelB,
    editFields,
    isEditorOpen,
    setActiveCardType,
    setDetailLevelB,
    setEditFields,
    setEditorOpen,
    setPickerOpen,
    upsert,
    allowDelete,
    bannerHeight,
}: {
    bookmarkedScGroup: ScGroupType | null;
    bookmarkedScUser: ScUserType | null;
    isClean: boolean | null;
    data: ScCircleType[];
    detailLevelB: CommonDetailLevel;
    editFields: EditFieldsType | null;
    isEditorOpen: boolean;
    setActiveCardType: (payload: CommonCardType) => void;
    setDetailLevelB: (detailLevel: CommonDetailLevel) => void;
    setEditFields: (payload: EditFieldsType | null) => void;
    setEditorOpen: (payload: boolean) => void;
    setPickerOpen: (payload: boolean) => void;
    upsert: (keepEditorOpenNew: boolean, saveAsNew?: boolean, softDeleted?: boolean) => void;
    allowDelete?: boolean;
    bannerHeight: number;
}) => {
    const isCreate: boolean = !editFields?.current?.sc_circle_ledger_id;
    const pickedScUser: boolean = !!editFields?.current?.sc_user_ledger_id;
    const pickedScGroup: boolean = !!editFields?.current?.sc_group_ledger_id;
    const [swappedScUser, setSwappedScUser] = useState<boolean>(false);
    const [swappedScGroup, setSwappedScGroup] = useState<boolean>(false);
    const [topGridPosition, setTopGridPosition] = useState<string>("relative");
    const [disabledSave, setDisabledSave] = useState<boolean>(false);

    useEffect(() => {
        const haveSwappedScUser: boolean = pickedScUser &&
            bookmarkedScUser?.sc_user_ledger_id !== editFields?.current?.sc_user_ledger_id &&
            bookmarkedScUser?.sc_user_tx_id !== editFields?.current?.sc_user_tx_id;

        setSwappedScUser(haveSwappedScUser);
        setEditFields({
            incoming: {
                sc_user_ledger_id: bookmarkedScUser?.sc_user_ledger_id,
                sc_user_tx_id: bookmarkedScUser?.sc_user_tx_id,
            }
        } as EditFieldsType);
    }, [bookmarkedScUser?.sc_user_ledger_id, bookmarkedScUser?.sc_user_tx_id, editFields?.current?.sc_user_ledger_id, editFields?.current?.sc_user_tx_id]);
    useEffect(() => {
        setSwappedScGroup(pickedScGroup &&
            bookmarkedScGroup?.sc_group_ledger_id !== editFields?.current?.sc_group_ledger_id &&
            bookmarkedScGroup?.sc_group_tx_id !== editFields?.current?.sc_group_tx_id);
        setEditFields({
            incoming: {
                sc_group_ledger_id: bookmarkedScGroup?.sc_group_ledger_id,
                sc_group_tx_id: bookmarkedScGroup?.sc_group_tx_id,
            }
        } as EditFieldsType);
    }, [bookmarkedScGroup?.sc_group_ledger_id, bookmarkedScGroup?.sc_group_tx_id, editFields?.current?.sc_group_ledger_id, editFields?.current?.sc_group_tx_id]);
    useEffect(() => {
        setDisabledSave(
            !!isClean && (
                isCreate && !!editFields?.incoming?.sc_user_ledger_id && !!editFields?.incoming?.sc_group_ledger_id ||
                !isCreate && pickedScUser && pickedScGroup && !(swappedScUser || swappedScGroup)
            )
        );

        if (isCreate) {
            return;
        }
    }, [isCreate, pickedScUser, pickedScGroup, isClean,]);
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
                `${editFields?.current?.sc_circle_ledger_id ? "Update" : "Create New"} `,
                iconscCircle,
                `${KLabelScCircle} ${editFields?.current?.sc_circle_ledger_id ? `${editFields?.current?.sc_circle_ledger_id}` : "Entry"} `,
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
                            // paddingTop: '40px',
                            // paddingBottom: '40px',
                            zIndex: 999,
                        }}
                    >
                        <Grid container spacing={1}>
                            <Grid item lg={4} md={5} sm={6} xs={12}>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                        <FvCardScGroup
                                            data={
                                                bookmarkedScGroup as ScGroupType
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
                                                            swappedScUser
                                                        }
                                                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                                            event.preventDefault();

                                                            if (!swappedScUser) {
                                                                setActiveCardType(
                                                                    CommonCardType.scGroup,
                                                                );
                                                                setPickerOpen(true);
                                                            }
                                                        }}
                                                        title={bookmarkedScGroup?.sc_group_ledger_id ? `Replace ${payload.tag} ${payload.title}` : "Add New Entry"}
                                                    >
                                                        {bookmarkedScGroup?.sc_group_ledger_id
                                                            ? "Replace"
                                                            : `Add New ${payload.tag}`}
                                                    </IconButtonAddReplace>
                                                    {bookmarkedScGroup?.sc_group_ledger_id ? (
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
                                </Grid>
                            </Grid>
                            <Grid item lg={8} md={7} sm={6} xs={12}>
                                <Grid container spacing={0}>
                                    <Grid item xs={12}>
                                        <FvCardScUser
                                            data={
                                                bookmarkedScUser as ScUserType
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
                                                            swappedScGroup
                                                        }
                                                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                                            event.preventDefault();

                                                            if (!swappedScGroup) {
                                                                setActiveCardType(
                                                                    CommonCardType.scUser,
                                                                );
                                                                setPickerOpen(true);
                                                            }
                                                        }}
                                                        title={bookmarkedScUser?.sc_user_ledger_id ? `Replace ${payload.tag} ${payload.title}` : "Add New Entry"}
                                                    >
                                                        {bookmarkedScUser?.sc_user_ledger_id
                                                            ? "Replace"
                                                            : `Add New ${payload.tag}`}
                                                    </IconButtonAddReplace>
                                                    {bookmarkedScUser?.sc_user_ledger_id ? (
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
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <FvScDropdownRoles editFields={editFields} setEditFields={setEditFields} />
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
                            <FvScCircleLedger
                                data={data}
                                isModal={false}
                                detailLevel={detailLevelB}
                                setDetailLevel={setDetailLevelB}
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
                        <FvScCircleLedger
                            data={data}
                            isModal={false}
                            detailLevel={detailLevelB}
                            setDetailLevel={setDetailLevelB}
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
                    upsert={upsert}
                    allowDelete={allowDelete}
                    ledgerId={editFields?.current?.sc_circle_ledger_id}
                    canDoSaveAs
                />
            </DialogActions>
        </Dialog>
    );
};
