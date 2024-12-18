import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import "@foodvibes/App.css";
import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionClearCommonError,
    actionSetMainIsLoading,
    selectCommonErrors,
    selectMainIsLoading,
    selectUsername
} from "@foodvibes/app/mainSlice";
import { default as logo } from "@foodvibes/assets/logo.png";
import { FvIdBadge } from "@foodvibes/components/FvIdBadge";
import { FvMenu } from "@foodvibes/components/FvMenu";
import FvMessageShow from "@foodvibes/components/FvMessageShow";
import { selectProductIsLoading, selectScannedSessions } from "@foodvibes/features/product/productSlice";
import { CommonError, ILayoutTracker } from "@foodvibes/utils/commonTypes";
import { Avatar, Backdrop, CircularProgress, CssBaseline, IconButton, Toolbar, Tooltip } from "@mui/material";
import { closeSnackbar, SnackbarProvider } from "notistack";
import { KAppTitle, KAppVersion } from "./utils/commonConstants";
import useLayoutTracker from "./utils/hooks/useLayoutTracker";

const MainContent = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useAppDispatch();
    const commonErrors: CommonError[] = useAppSelector(selectCommonErrors);
    const mainIsLoading: boolean = useAppSelector(selectMainIsLoading);
    const productIsLoading: boolean = useAppSelector(selectProductIsLoading);
    const scannedSessions: string[] = useAppSelector(selectScannedSessions);
    const username: string | null = useAppSelector(selectUsername);
    const setMainIsLoading = (loading: boolean) => dispatch(actionSetMainIsLoading(loading));

    const handleClick = (isAlt: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = async (url: string) => {
        setAnchorEl(null);

        if (url) {
            navigate(url);
        }
    };
    const clearErrorsCb = (count: number) => {
        dispatch(actionClearCommonError(count));
    };
    const [windowWidth, setWindowWith] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const headerTracker: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight]);
    const outletTracker: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight, headerTracker]);
    const titleTracker: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight, outletTracker]);
    const bodyTracker: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight, outletTracker, titleTracker]);
    const onResize = useCallback(() => {
        setWindowWith(window.innerWidth);
        setWindowHeight(window.innerHeight);
    }, [window.innerWidth, window.innerHeight]);

    useEffect(() => {
        window.addEventListener("resize", onResize);
        onResize();
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);
    useEffect(() => {
        setMainIsLoading(false); // Do this to flag ending of double mounting of this component by React
    }, []);

    // console.info('----------------------------------------');
    // console.info('##headerTracker', headerTracker.top, headerTracker.height);
    // console.info('##outletTracker', outletTracker.top, outletTracker.height);
    // console.info('##titleTracker', titleTracker.top, titleTracker.height);
    // console.info('##bodyTracker', bodyTracker.top, bodyTracker.height);

    return (
        <FluentProvider theme={webLightTheme}>
            <Box
                ref={headerTracker.ref}
                sx={{ display: "block", height: "48px", width: "100%" }}
                className="App"
                onClick={() => closeSnackbar()}
            >
                <CssBaseline />
                <FvMenu
                    handleClose={handleClose}
                    anchorEl={anchorEl}
                    open={open}
                />
                <AppBar position="static" >
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
                                            top: "10px",
                                            marginRight: windowWidth > 480 ? 10 : 0,
                                            backgroundColor: "rgb(25, 118, 210)",
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
                        {productIsLoading ? (
                            <div style={{
                                borderRadius: "12px 0 0 0",
                                backgroundColor: "gainsboro",
                                color: "darkblue",
                                zIndex: 1320,
                                position: "absolute",
                                top: "calc(100vh - 28px)",
                                right: "0px",
                                overflow: "hidden",
                                padding: "4px 12px",
                            }}>
                                <span style={{ margin: "0 8px 0 0", whiteSpace: "nowrap", }}>
                                    <CircularProgress color="inherit" style={{ width: "12px", height: "12px", margin: "0 8px 0 0", }} />
                                    <span style={{ position: "relative", top: "-1px", }}>
                                        Loading...
                                    </span>
                                </span>
                            </div>) : null}
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
                            <FvIdBadge assumedUsername={username} assumedAccessMask={0} />
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box >
            <Box
                ref={outletTracker.ref}
                id="detail"
                sx={{
                    display: "block",
                    backgroundColor: "white",
                    width: "100%",
                    height: `calc(100vh - ${headerTracker.height}px)`,
                    overflow: "hidden",
                }}
            >
                <Outlet context={{ outletTracker, titleTracker, bodyTracker }} />
            </Box>
            <FvMessageShow
                clearErrorsCb={clearErrorsCb}
                commonErrors={commonErrors}
            />
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 110 }}
                open={
                    mainIsLoading || scannedSessions?.length > 0 //|| productIsLoading
                }
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </FluentProvider >
    );
};

const App = () => {
    return (
        <SnackbarProvider maxSnack={12} dense preventDuplicate>
            <MainContent />
        </SnackbarProvider>
    );
};

export default App;
