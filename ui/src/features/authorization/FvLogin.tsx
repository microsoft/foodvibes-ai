import { useMsal } from "@azure/msal-react";
import { Button } from "@fluentui/react-components";
import { useAppDispatch } from "@foodvibes/app/hooks";
import iconLogin from "@foodvibes/assets/login.png";
import { loginRequest } from "@foodvibes/services/authConfig";
import { KMenuLabelLogIn } from "@foodvibes/utils/commonConstants";
import CommonMessageSend from "@foodvibes/utils/commonMessageSend";
import { CommonError } from "@foodvibes/utils/commonTypes";
import Box from "@mui/material/Box";
import clsx from "clsx";

export const FvLogin = () => {
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const handleRedirect = () => {
        instance.loginRedirect({
            ...loginRequest,
            prompt: "create",
        }).catch((error) => {
            CommonMessageSend(dispatch, error as CommonError);
        });
    };

    return <Box className={"Notification-area"}>
        <Box component="div" sx={{ margin: "0" }}>
            Full features are available to authenticated users.
            <Button className={"Notification-area-button"}
                type="button"
                onClick={() => {
                    handleRedirect();
                }}
            >
                <Box component="div" className={"App-menu-frame2"}>
                    <Box component="span" className={clsx("App-menu-icon-frame", "App-menu-icon-frame2")}>
                        <img
                            src={iconLogin}
                            className="App-menu-icon"
                            alt="item icon"
                        />
                    </Box>
                    <Box component="span" className={clsx("App-menu-text", "App-menu-text2")}>
                        {KMenuLabelLogIn}
                    </Box>
                </Box>
            </Button>
        </Box>
    </Box>;
};
