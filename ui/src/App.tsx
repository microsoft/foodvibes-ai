import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import "@sbssrc/App.css";
import { useAppDispatch, useAppSelector } from "@sbssrc/app/hooks";
import {
    actionClearCommonError,
    actionSetMainIsLoading,
    selectCommonErrors,
    selectMainIsLoading,
    selectUsername
} from "@sbssrc/app/mainSlice";
import { default as logo } from "@sbssrc/assets/logo.png";
import { SbsMenu } from "@sbssrc/components/SbsMenu";
import SbsMessageShow from "@sbssrc/components/SbsMessageShow";
import { selectSilentOpInProgress, selectSessionIsLoading, selectScannedSessions } from "@sbssrc/features/session/sessionSlice";
import { CommonError, ILayoutTracker } from "@sbssrc/utils/commonTypes";
import { Backdrop, CircularProgress, CssBaseline, IconButton, Toolbar } from "@mui/material";
import { closeSnackbar, SnackbarProvider } from "notistack";
import { KAppTitle, KAppVersion } from "./utils/commonConstants";
import useLayoutTracker from "./utils/hooks/UseLayoutTracker";

const MainContent = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useAppDispatch();
    const commonErrors: CommonError[] = useAppSelector(selectCommonErrors);
    const mainIsLoading: boolean = useAppSelector(selectMainIsLoading);
    const sessionIsLoading: boolean = useAppSelector(selectSessionIsLoading);
    const silentOpInProgress: boolean = useAppSelector(selectSilentOpInProgress);
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
    const titleTracker: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight]);
    const bodyTracker: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight, titleTracker]);
    const titleTracker2: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight]);
    const bodyTracker2: ILayoutTracker = useLayoutTracker([windowWidth, windowHeight, titleTracker2]);
    const outletTracker: ILayoutTracker = useLayoutTracker(
        [
            windowWidth, windowHeight,
            headerTracker, titleTracker.ref?.current, bodyTracker.ref?.current,
            titleTracker2.ref?.current, bodyTracker2.ref?.current
        ]
    );
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

    console.info('----------------------------------------');
    console.info('##windowWidth', windowWidth);
    console.info('##windowHeight', windowHeight);
    console.info('##headerTracker t,w,h', headerTracker.top, headerTracker.width, headerTracker.height);
    console.info('##outletTracker t,w,h', outletTracker.top, outletTracker.width, outletTracker.height);
    console.info('##titleTracker t,w,h', titleTracker.top, titleTracker.width, titleTracker.height);
    console.info('##bodyTracker t,w,h', bodyTracker.top, bodyTracker.width, bodyTracker.height);
    console.info('##titleTracker2 t,w,h', titleTracker2.top, titleTracker2.width, titleTracker2.height);
    console.info('##bodyTracker2 t,w,h', bodyTracker2.top, bodyTracker2.width, bodyTracker2.height);

    return (
        <FluentProvider theme={webLightTheme}>
            <Box
                ref={headerTracker.ref}
                sx={{ display: "block", height: "48px", width: "100%" }}
                className="App"
                onClick={() => closeSnackbar()}
            >
                <CssBaseline />
                <SbsMenu
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
                            <a href="/" style={{ color: "white", position: "absolute", left: "60px", top: "0px", height: "48px", }}>
                                <Box sx={{ height: "48px" }}>
                                    <img
                                        src={logo}
                                        className={"App-logo"}
                                        height={26}
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
                        {sessionIsLoading ? (
                            <div style={{
                                borderRadius: "12px 12px 0 0",
                                backgroundColor: "gainsboro",
                                color: "darkblue",
                                zIndex: 1320,
                                position: "absolute",
                                top: "calc(100vh - 28px)",
                                right: "16px",
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
                    maxHeight: `calc(100vh - ${headerTracker.height}px)`,
                    minHeight: `calc(100vh - ${headerTracker.height}px)`,
                    overflow: "hidden",
                }}
            >
                <Outlet context={{ outletTracker, titleTracker, bodyTracker, titleTracker2, bodyTracker2 }} />
            </Box>
            <SbsMessageShow
                clearErrorsCb={clearErrorsCb}
                commonErrors={commonErrors}
            />
            <Backdrop
                sx={{ backgroundColor: 'rgb(255, 255, 255, 0.4)', color: 'navy', zIndex: (theme) => theme.zIndex.drawer + 110 }}
                open={
                    mainIsLoading || scannedSessions?.length > 0 || (sessionIsLoading && !silentOpInProgress)
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
