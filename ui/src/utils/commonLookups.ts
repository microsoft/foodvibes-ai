import { default as iconHome } from "@sbssrc/assets/logo.png";
import iconProduct from "@sbssrc/assets/product.png";
import {
    KMenuLabelHome,
    KMenuLabelProduct,
    KRoleGeotrackOwner,
    KRoleGlobalOwner,
    KRoleNameGeotrackOwner,
    KRoleNameGlobalOwner,
    KRoleNameProductOwner,
    KRoleNameShortGeotrackOwner,
    KRoleNameShortGlobalOwner,
    KRoleNameShortProductOwner,
    KRoleNameShortSupplyChainOwner,
    KRoleNameShortSupplyChainViewer,
    KRoleNameSupplyChainOwner,
    KRoleNameSupplyChainViewer,
    KRoleNone,
    KRoleProductOwner,
    KRoleSupplyChainOwner,
    KRoleSupplyChainViewer
} from "./commonConstants";
import { CommonCheckListType, MenuItemType } from "./commonTypes";

export const RoleChoices: CommonCheckListType[] = [
    {
        id: 0,
        shortName: KRoleNameShortProductOwner,
        name: KRoleNameProductOwner,
        value: KRoleProductOwner,
        checked: false,
    },
    {
        id: 1,
        shortName: KRoleNameShortGeotrackOwner,
        name: KRoleNameGeotrackOwner,
        value: KRoleGeotrackOwner,
        checked: false,
    },
    {
        id: 2,
        shortName: KRoleNameShortSupplyChainOwner,
        name: KRoleNameSupplyChainOwner,
        value: KRoleSupplyChainOwner,
        checked: false,
    },
    {
        id: 3,
        shortName: KRoleNameShortSupplyChainViewer,
        name: KRoleNameSupplyChainViewer,
        value: KRoleSupplyChainViewer,
        checked: false,
    },
    {
        id: 4,
        shortName: KRoleNameShortGlobalOwner,
        name: KRoleNameGlobalOwner,
        value: KRoleGlobalOwner,
        checked: false,
    }
];

export const MenuItems: MenuItemType[] = [
    {
        label: KMenuLabelHome,
        icon: iconHome,
        accessMask: KRoleNone,
        alwaysShow: true,
    },
    {
        label: KMenuLabelProduct,
        icon: iconProduct,
        accessMask: KRoleNone,
        alwaysShow: true,
    },
];
