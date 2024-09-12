import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { useCallback, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { IPublicClientApplication, PublicClientApplication } from "@azure/msal-browser";
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import "@foodvibes/App.css";
import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionClearCommonError,
    actionSetAccessToken,
    actionSetAssumedAccessMask,
    actionSetAssumedGroups,
    actionSetAssumedUsername,
    actionSetMainIsLoading,
    actionSetMapsApiKey,
    actionSetMapsEngineIsReady,
    actionSetPreferredUsername,
    actionSetUsername,
    selectAccessToken,
    selectAssumedAccessMask,
    selectAssumedUsername,
    selectCommonErrors,
    selectMainIsLoading,
    selectMapsApiKey,
    selectPreferredAccessMask,
    selectPreferredUsername,
    selectUsername
} from "@foodvibes/app/mainSlice";
import { default as logo } from "@foodvibes/assets/logo.png";
import { FvIdBadge } from "@foodvibes/components/FvIdBadge";
import { FvMenu } from "@foodvibes/components/FvMenu";
import FvMessageShow from "@foodvibes/components/FvMessageShow";
import { FvHome } from "@foodvibes/features/authorization/FvHome";
import { actionResetDataGeotrack, selectGeotrackIsLoading } from "@foodvibes/features/geotrack/geotrackSlice";
import { actionResetDataProduct, selectProductIsLoading } from "@foodvibes/features/product/productSlice";
import { actionResetDataTrackingProducts, selectTrackingProductsLoading } from "@foodvibes/features/trackingProducts/trackingProductsSlice";
import { MsalContext, RefreshAccessTokenIfNeeded } from "@foodvibes/services/authCommon";
import { loginRequest } from "@foodvibes/services/authConfig";
import { BookmarkScUser, LoadMicrosoftMapsApi, QueryParamsInit } from "@foodvibes/utils/commonFunctions";
import CommonMessageSend from "@foodvibes/utils/commonMessageSend";
import { CommonCardType, CommonError, CommonScCircleType, QueryParamsType, QueryResponseType, ScUserType } from "@foodvibes/utils/commonTypes";
import { Avatar, Backdrop, CircularProgress, CssBaseline, IconButton, Toolbar, Tooltip } from "@mui/material";
import { closeSnackbar, SnackbarProvider } from "notistack";
import { FvCommonModalPicker } from "./features/commonModals/FvCommonModalPicker";
import { selectScCircleIsLoading } from "./features/scCircle/scCircleSlice";
import { selectScGroupIsLoading } from "./features/scGroup/scGroupSlice";
import { actionSelectScUser, selectScUserIsLoading, selectScUserResponse } from "./features/scUser/scUserSlice";
import { KAppTitle, KAppVersion, KMenuActionImpersonate, KMenuActionLogin, KMenuActionLogout } from "./utils/commonConstants";

const MainContentAuthenticated = ({
    instance,
    accessToken,
    mainIsLoading,
    mapsApiKey,
    assumedUsername,
    setAccessToken,
    setMainIsLoading,
    selectScUser,
    setMapsApiKey,
}: {
    instance: IPublicClientApplication;
    accessToken: string | null;
    mainIsLoading: boolean;
    mapsApiKey: string | null;
    assumedUsername: string | null;
    setAccessToken: (acccessToken: string) => void;
    setMainIsLoading: (loading: boolean) => void;
    selectScUser: (queryParams: QueryParamsType) => void;
    setMapsApiKey: () => void;
}) => {
    useEffect(() => {
        setMainIsLoading(false); // Do this to flag ending of double mounting of this component by React
    }, []);

    useEffect(() => {
        if (!mainIsLoading && !accessToken) {
            RefreshAccessTokenIfNeeded(accessToken, instance).then((accessToken) => {
                setAccessToken(accessToken);
            });
        }
    }, [mainIsLoading, accessToken]);

    useEffect(() => {
        if (accessToken) {
            if (!mapsApiKey) {
                setMapsApiKey();
            }
            if (assumedUsername) {
                selectScUser(
                    QueryParamsInit({
                        reportMode: true,
                        columnFilters: [
                            {
                                id: "sc_user_id",
                                value: assumedUsername,
                            },
                        ],
                    }),
                );
            }
        }
    }, [accessToken, assumedUsername]);

    return <Outlet />;
};

/**
 * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
 * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
 * only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const MainContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
    const open2 = Boolean(anchorEl2);
    const dispatch = useAppDispatch();
    const commonErrors: CommonError[] = useAppSelector(selectCommonErrors);
    const mainIsLoading: boolean = useAppSelector(selectMainIsLoading);
    const productIsLoading: boolean = useAppSelector(selectProductIsLoading);
    const geotrackIsLoading: boolean = useAppSelector(selectGeotrackIsLoading);
    const trackingProductsIsLoading: boolean = useAppSelector(selectTrackingProductsLoading);
    const scUserIsLoading: boolean = useAppSelector(selectScUserIsLoading);
    const scGroupIsLoading: boolean = useAppSelector(selectScGroupIsLoading);
    const scCircleIsLoading: boolean = useAppSelector(selectScCircleIsLoading);
    const accessToken: string | null = useAppSelector(selectAccessToken);
    const mapsApiKey: string | null = useAppSelector(selectMapsApiKey);
    const assumedUsername: string | null = useAppSelector(selectAssumedUsername);
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const preferredUsername: string | null = useAppSelector(selectPreferredUsername);
    const preferredAccessMask: number | null = useAppSelector(selectPreferredAccessMask);
    const username: string | null = useAppSelector(selectUsername);
    const scUserResponse: QueryResponseType<ScUserType> = useAppSelector(selectScUserResponse);
    const selectScUser = (queryParams: QueryParamsType) => dispatch(actionSelectScUser({ queryParams, accessToken, instance, }));
    const setMapsApiKey = () => dispatch(actionSetMapsApiKey(accessToken));
    const setAccessToken = (accessToken: string) => dispatch(actionSetAccessToken(accessToken));
    const setAssumedUsername = (assumedUsername: string | null) => dispatch(actionSetAssumedUsername(assumedUsername));
    const setAssumedAccessMask = (assumedAccessMask: number | null) => dispatch(actionSetAssumedAccessMask(assumedAccessMask));
    const setAssumedGroups = (assumedGroups: CommonScCircleType[] | null) => dispatch(actionSetAssumedGroups(assumedGroups));
    const setPreferredUsername = (preferredUsername: string | null) => dispatch(actionSetPreferredUsername(preferredUsername));
    const setUsername = (username: string | null) => dispatch(actionSetUsername(username));
    const setMainIsLoading = (loading: boolean) => dispatch(actionSetMainIsLoading(loading));
    const resetDataGeotrack = () => { dispatch(actionResetDataGeotrack()) };
    const resetDataProduct = () => { dispatch(actionResetDataProduct()) };
    const resetDataTrackingProducts = () => { dispatch(actionResetDataTrackingProducts()) };
    const [showImpersonation, setShowImpersonation] = useState<boolean>(false);

    const restoreAlias = () => {
        if (preferredUsername !== assumedUsername) {
            setAssumedUsername(preferredUsername);
            setAssumedAccessMask(null);
            setAssumedGroups(null);
            actionResetDataGeotrack();
            resetDataProduct();
            resetDataTrackingProducts();
        }
        BookmarkScUser(dispatch, null);
    };

    const handleClick = (isAlt: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
        if (isAlt) {
            setAnchorEl2(event.currentTarget);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };
    const handleClose = async (url: string) => {
        setAnchorEl(null);
        setAnchorEl2(null);

        switch (url) {
            case KMenuActionLogin:
                instance.loginRedirect({
                    ...loginRequest,
                    prompt: "create",
                }).catch((error) => {
                    CommonMessageSend(dispatch, error as CommonError);
                });
                break;
            case KMenuActionLogout:
                instance.logout({
                    account: username ? instance.getAccountByUsername(username) : instance.getAllAccounts()[0],
                    postLogoutRedirectUri: "/"
                });
                break;
            case KMenuActionImpersonate:
                setShowImpersonation(true);
                break;
            default:
                if (url) {
                    navigate(url);
                }
                break;
        };
    };
    const clearErrorsCb = (count: number) => {
        dispatch(actionClearCommonError(count));
    };

    useEffect(() => {
        setAssumedAccessMask(null);
        setAssumedGroups(null);

        if (activeAccount?.idTokenClaims?.name) {
            setAssumedUsername(activeAccount.idTokenClaims["preferred_username"]?.toString() ?? "");
            setPreferredUsername(activeAccount.idTokenClaims["preferred_username"]?.toString() ?? "");
            setUsername(activeAccount.idTokenClaims["name"]?.toString() ?? "");
        } else {
            setAssumedUsername(null);
            setPreferredUsername(null);
            setUsername(null);
        }
    }, [activeAccount?.idTokenClaims?.name]);

    useEffect(() => {
        if (scUserResponse.reportData?.length) {
            setAssumedAccessMask(scUserResponse.reportData[0].access_mask);
        }
    }, [scUserResponse.reportData]);

    useEffect(() => {
        if (!mapsApiKey) return;

        LoadMicrosoftMapsApi(mapsApiKey)
            .then(() => {
                dispatch(actionSetMapsEngineIsReady(true));
            })
            .catch((error: string | Event) => {
                console.error(error);
            });
    }, [mapsApiKey]);

    const [windowWidth, setWindowWith] = useState(window.innerWidth);

    const onResize = useCallback(() => {
        setWindowWith(window.innerWidth);
    }, [window.innerWidth]);
    useEffect(() => {
        window.addEventListener("resize", onResize);
        onResize();
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <FluentProvider theme={webLightTheme}>
            <Box
                sx={{ display: "flex" }}
                className="App"
                onClick={() => closeSnackbar()}
            >
                <CssBaseline />
                <FvMenu
                    username={username}
                    preferredUsername={preferredUsername}
                    preferredAccessMask={preferredAccessMask}
                    assumedUsername={assumedUsername}
                    assumedAccessMask={assumedAccessMask}
                    restoreAlias={restoreAlias}
                    handleClose={handleClose}
                    anchorEl={anchorEl}
                    anchorEl2={anchorEl2}
                    open={open}
                    open2={open2}
                />
                <AppBar position="static" sx={{ height: "48px" }}>
                    <Toolbar variant="dense">
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ margin: 0, padding: 0 }}
                            id="basic-button"
                            aria-controls={
                                open ? "basic-menu" : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleClick(false, event)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box className="App-header">
                            <a href="/" style={{ color: "white", position: "absolute", left: "60px", top: "0px" }}>
                                <Box>
                                    <img
                                        src={logo}
                                        className={"App-logo"}
                                        height={26}
                                        width={windowWidth > 480 ? 80.97 : 0}
                                        alt="logo"
                                        style={{
                                            borderWidth: windowWidth > 480 ? 1 : 0,
                                            position: "relative",
                                            top: "4px",
                                            marginRight: windowWidth > 480 ? 10 : 0,
                                        }}
                                    />
                                    <span className="App-title">
                                        {KAppTitle}
                                    </span>
                                </Box>
                                <Box className="App-version" title={`${KAppTitle} application version`}>
                                    Version {KAppVersion}
                                </Box>
                            </a>
                        </Box>
                        <Tooltip title={"Profile, roles & permissions"}>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ margin: 0, padding: 0 }}
                                id="basic-button"
                                aria-controls={
                                    open ? "basic-menu" : undefined
                                }
                                aria-haspopup="true"
                                aria-expanded={open ? "true" : undefined}
                                onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleClick(true, event)}
                            >
                                <Avatar className={"App-profile-badge"}>{username?.substring(0, 1)}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Box sx={{
                            position: "absolute",
                            top: "6px",
                            right: "60px",
                        }}>
                            <FvIdBadge assumedUsername={assumedUsername} assumedAccessMask={assumedAccessMask} />
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box >
            <div
                id="detail"
                style={{
                    width: "100%",
                    position: "absolute",
                    top: "48px",
                    height: "calc(100vh - 48px)",
                    overflow: "hidden",
                }}
            >
                <AuthenticatedTemplate>
                    <MainContentAuthenticated
                        instance={instance}
                        accessToken={accessToken}
                        mainIsLoading={mainIsLoading}
                        mapsApiKey={mapsApiKey}
                        assumedUsername={assumedUsername}
                        setAccessToken={setAccessToken}
                        setMainIsLoading={setMainIsLoading}
                        selectScUser={selectScUser}
                        setMapsApiKey={setMapsApiKey}
                    />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <FvHome />
                </UnauthenticatedTemplate>
            </div>
            <FvCommonModalPicker
                currActiveCardType={CommonCardType.impersonation}
                readOnly
                isPickerOpen={showImpersonation}
                setPickerOpen={setShowImpersonation}
            />
            <FvMessageShow
                clearErrorsCb={clearErrorsCb}
                commonErrors={commonErrors}
            />
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 110 }}
                open={
                    mainIsLoading ||
                    productIsLoading ||
                    geotrackIsLoading ||
                    trackingProductsIsLoading ||
                    scUserIsLoading ||
                    scGroupIsLoading ||
                    scCircleIsLoading
                }
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {/* {
                (
                    mainIsLoading ||
                    productIsLoading ||
                    geotrackIsLoading ||
                    trackingProductsIsLoading ||
                    scUserIsLoading ||
                    scGroupIsLoading ||
                    scCircleIsLoading

                ) && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            width: "100%",
                            zIndex: 999999,
                        }}
                    >
                        <LinearProgress />
                    </Box>
                )
            } */}
        </FluentProvider >
    );
};

/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const App = () => {
    const msalInstance: PublicClientApplication = useContext(
        MsalContext
    ) as PublicClientApplication;

    return (
        <MsalProvider instance={msalInstance}>
            <SnackbarProvider maxSnack={12} dense preventDuplicate>
                <MainContent />
            </SnackbarProvider>
        </MsalProvider>
    );
};

export default App;
