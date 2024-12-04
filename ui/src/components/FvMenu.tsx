import Box from "@mui/material/Box";
import { useMemo } from "react";

import "@foodvibes/App.css";
import { FvIdBadge } from "@foodvibes/components/FvIdBadge";
import {
    KMenuActionImpersonate,
    KMenuActionLogin,
    KMenuActionLogout,
    KMenuLabelCircleConfiguration,
    KMenuLabelGeotrack,
    KMenuLabelGroupManagement,
    KMenuLabelHome,
    KMenuLabelImpersonate,
    KMenuLabelLogIn,
    KMenuLabelLogOut,
    KMenuLabelProduct,
    KMenuLabelTrackingProducts,
    KMenuLabelUserManagement
} from "@foodvibes/utils/commonConstants";
import { MenuItems } from "@foodvibes/utils/commonLookups";
import { MenuItemType } from "@foodvibes/utils/commonTypes";
import { Menu, MenuItem } from "@mui/material";


export const FvMenu = (
    {
        handleClose,
        anchorEl,
        open,
    }: {
        handleClose: (url: string) => void;
        anchorEl: null | HTMLElement;
        open: boolean;
    }
) => {
    const menuItems: MenuItemType[] = useMemo<MenuItemType[]>(() => MenuItems.map(e => {
        switch (e.label) {
            case KMenuLabelHome:
                return { ...e, cbFn: () => handleClose("/") };
            case KMenuLabelProduct:
                return { ...e, cbFn: () => handleClose("/product") };
            default:
                return e;
        }
    }), []);

    return <>
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                "aria-labelledby": "basic-button",
            }}
        >
            {
                menuItems.filter(e => !e.isAlt).map((e, idx) => ((
                    <MenuItem key={`menu${idx}`} onClick={() => e.cbFn && e.cbFn()}>
                        <Box component="div" className="App-menu-frame">
                            <Box component="span" className="App-menu-icon-frame">
                                <img
                                    src={e.icon}
                                    className="App-menu-icon"
                                    alt="item icon"
                                />
                            </Box>
                            <Box component="span" className="App-menu-text">
                                {e.label}
                            </Box>
                        </Box>
                    </MenuItem>
                )))
            }
        </Menu>
    </>;
};
