import { useMsal } from "@azure/msal-react";
import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionSetActiveCardType,
    actionSetAssumedUsername,
    actionSetPickerOpen,
    selectActiveCardType,
    selectAssumedAccessMask,
    selectBookmarkedScUser,
    selectPickerOpen
} from "@foodvibes/app/mainSlice";
import FvCardScUser from "@foodvibes/components/FvCardScUser";
import { FvIdNoAccessMessage } from "@foodvibes/components/FvIdNoAccessMessage";
import { IdTokenData } from "@foodvibes/services/dataDisplay";
import { KMenuLabelImpersonate } from "@foodvibes/utils/commonConstants";
import { MenuItems } from "@foodvibes/utils/commonLookups";
import {
    IconButtonAddReplace
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonCardType,
    CommonDetailLevel,
    MenuItemType,
    ScUserType
} from "@foodvibes/utils/commonTypes";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Grid
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { FvCommonModalPicker } from "@foodvibes/features/commonModals/FvCommonModalPicker";

export const FvPermissions = () => {
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const activeAccount = instance.getActiveAccount();
    const bookmarkedScUser: ScUserType | null = useAppSelector(selectBookmarkedScUser);
    const currActiveCardType: CommonCardType | null = useAppSelector(selectActiveCardType);
    const isPickerOpen: boolean = useAppSelector(selectPickerOpen) ?? false;
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const setPickerOpen = (payload: boolean) => dispatch(actionSetPickerOpen(payload));
    const setActiveCardType = (payload: CommonCardType) => dispatch(actionSetActiveCardType(payload));
    const setAssumedUsername = (assumedUsername: string | null) => dispatch(actionSetAssumedUsername(assumedUsername));
    const menuItem: MenuItemType | undefined = useMemo<MenuItemType | undefined>(() => MenuItems.find(
        e => e.label === KMenuLabelImpersonate && (assumedAccessMask ?? 0) & e.accessMask), [assumedAccessMask]);

    useEffect(() => {
        if (bookmarkedScUser?.sc_user_ledger_id) {
            setAssumedUsername(bookmarkedScUser?.sc_user_id);
        }
    }, [bookmarkedScUser?.sc_user_ledger_id]);

    return !menuItem ? <FvIdNoAccessMessage /> : (
        <>
            <Grid container spacing={0} sx={{
                margin: "12px -10px 0 0",
                padding: "12px 0",
            }}>
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
                                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                        event.preventDefault();

                                        setActiveCardType(
                                            CommonCardType.scUser,
                                        );
                                        setPickerOpen(true);
                                    }}
                                    title={`${bookmarkedScUser?.sc_user_ledger_id ? "Replace" : "Select a"} user to impersonate"`}
                                >
                                    {`${bookmarkedScUser?.sc_user_ledger_id ? "Replace" : "Select a"} ${payload.tag} to impersonate`}
                                </IconButtonAddReplace>
                                {bookmarkedScUser?.sc_user_ledger_id && (
                                    `${payload.tag} ${payload.title}`
                                )}
                            </>
                        )}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ArrowDownwardIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Box sx={{
                                // border: "1px solid silver", padding: "12px", width: "100%", backgroundColor: "lightyellow", overflow: "auto",
                            }}>
                                Claims in your <strong>ID token</strong>.
                                For more information, visit:{" "}
                                <a
                                    target="__docs__"
                                    href="https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens#claims-in-an-id-token">
                                    docs.microsoft.com
                                </a>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <IdTokenData idTokenClaims={activeAccount?.idTokenClaims} heightOffset={bookmarkedScUser?.sc_user_ledger_id ? 94 : 0} />
                        </AccordionDetails>
                    </Accordion>
                </Grid >
            </Grid >

            <FvCommonModalPicker
                currActiveCardType={currActiveCardType}
                readOnly={true}
                isPickerOpen={isPickerOpen}
                setPickerOpen={setPickerOpen}
            />
        </>
    );
};
