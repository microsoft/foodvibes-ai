import { default as iconHome } from "@sbssrc/assets/logo.png";
import {
    KMenuLabelHome,
    KMenuLabelSession,
    KRoleNone
} from "./commonConstants";
import { MenuItemType } from "./commonTypes";

export const MenuItems: MenuItemType[] = [
    {
        label: KMenuLabelHome,
        icon: iconHome,
        accessMask: KRoleNone,
        alwaysShow: true,
    },
    {
        label: KMenuLabelSession,
        icon: iconHome,
        accessMask: KRoleNone,
        alwaysShow: true,
    },
];
