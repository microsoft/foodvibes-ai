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
        username,
        preferredUsername,
        preferredAccessMask,
        assumedUsername,
        assumedAccessMask,
        restoreAlias,
        handleClose,
        anchorEl,
        anchorEl2,
        open,
        open2,
    }: {
        username: string | null;
        preferredUsername: string | null;
        preferredAccessMask: number | null;
        assumedUsername: string | null;
        assumedAccessMask: number | null;
        restoreAlias: (() => void) | null;
        handleClose: (url: string) => void;
        anchorEl: null | HTMLElement;
        anchorEl2: null | HTMLElement;
        open: boolean;
        open2: boolean;
    }
) => {
    const menuItemsAll: MenuItemType[] = useMemo<MenuItemType[]>(() => MenuItems.map(e => {
        switch (e.label) {
            case KMenuLabelHome:
                return { ...e, cbFn: () => handleClose("/") };
            case KMenuLabelProduct:
                return { ...e, cbFn: () => handleClose("/product") };
            case KMenuLabelGeotrack:
                return { ...e, cbFn: () => handleClose("/geotrack") };
            case KMenuLabelTrackingProducts:
                return { ...e, cbFn: () => handleClose("/tracking-products") };
            case KMenuLabelUserManagement:
                return { ...e, cbFn: () => handleClose("/permissions/scuser") };
            case KMenuLabelGroupManagement:
                return { ...e, cbFn: () => handleClose("/permissions/scgroup") };
            case KMenuLabelCircleConfiguration:
                return { ...e, cbFn: () => handleClose("/permissions/sccircle") };
            case KMenuLabelLogOut:
                return { ...e, cbFn: () => handleClose(KMenuActionLogout) };
            case KMenuLabelLogIn:
                return { ...e, cbFn: () => handleClose(KMenuActionLogin) };
            case KMenuLabelImpersonate:
                return { ...e, cbFn: () => handleClose(KMenuActionImpersonate) };
            default:
                return e;
        }
    }), []);

    const menuItems: MenuItemType[] = useMemo<MenuItemType[]>(() =>
        menuItemsAll.filter(e =>
            e.alwaysShow ||
            assumedUsername && e.showIfAuthenticated && username ||
            !assumedUsername && !assumedAccessMask && e.showIfUnauthenticated && !username ||
            (assumedUsername && assumedAccessMask && assumedAccessMask & e.accessMask)),
        [assumedUsername, assumedAccessMask]);

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
        <Menu
            id="basic-menu"
            anchorEl={anchorEl2}
            open={open2}
            onClose={handleClose}
            MenuListProps={{
                "aria-labelledby": "basic-button",
            }}
        >
            <FvIdBadge forceShowAll={(username ?? "")?.length > 0}
                assumedUsername={assumedUsername}
                assumedAccessMask={assumedAccessMask}
                preferredUsername={preferredUsername}
                preferredAccessMask={preferredAccessMask}
                username={username}
                restoreAlias={restoreAlias}
            />
            {
                menuItems.filter(e => e.isAlt).map((e, idx) => ((
                    <MenuItem key={`menu${idx}`} onClick={() => e.cbFn && e.cbFn()}>
                        <div className="App-menu-frame">
                            <span className="App-menu-icon-frame">
                                <img
                                    src={e.icon}
                                    className="App-menu-icon"
                                    alt="item icon"
                                />
                            </span>
                            <span className="App-menu-text">
                                {e.label}
                            </span>
                        </div>
                    </MenuItem>
                )))
            }
        </Menu>
    </>;
};
