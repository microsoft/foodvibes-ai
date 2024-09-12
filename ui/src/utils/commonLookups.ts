import iconGeotrack from "@foodvibes/assets/geotrack.png";
import iconLogin from "@foodvibes/assets/login.png";
import { default as iconHome } from "@foodvibes/assets/logo.png";
import iconLogout from "@foodvibes/assets/logout.png";
import iconPermissions from "@foodvibes/assets/permissions.png";
import iconProduct from "@foodvibes/assets/product.png";
import iconScCircle from "@foodvibes/assets/sc_circle.png";
import iconScGroup from "@foodvibes/assets/sc_group.png";
import iconScUser from "@foodvibes/assets/sc_user.png";
import iconTrackingProducts from "@foodvibes/assets/tracking-products.png";
import {
    KMenuLabelCircleConfiguration,
    KMenuLabelGeotrack,
    KMenuLabelGroupManagement,
    KMenuLabelHome,
    KMenuLabelImpersonate,
    KMenuLabelLogIn,
    KMenuLabelLogOut,
    KMenuLabelProduct,
    KMenuLabelTrackingProducts,
    KMenuLabelUserManagement,
    KRoleAll,
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
        accessMask: KRoleGlobalOwner | KRoleSupplyChainViewer | KRoleSupplyChainOwner | KRoleProductOwner,
    },
    {
        label: KMenuLabelGeotrack,
        icon: iconGeotrack,
        accessMask: KRoleGlobalOwner | KRoleSupplyChainViewer | KRoleSupplyChainOwner | KRoleGeotrackOwner,
    },
    {
        label: KMenuLabelTrackingProducts,
        icon: iconTrackingProducts,
        accessMask: KRoleAll,
    },
    {
        label: KMenuLabelImpersonate,
        icon: iconPermissions,
        isAlt: true,
        accessMask: KRoleGlobalOwner | KRoleSupplyChainOwner,
    },
    {
        label: KMenuLabelUserManagement,
        icon: iconScUser,
        isAlt: true,
        accessMask: KRoleGlobalOwner | KRoleSupplyChainOwner,
    },
    {
        label: KMenuLabelGroupManagement,
        icon: iconScGroup,
        isAlt: true,
        accessMask: KRoleGlobalOwner | KRoleSupplyChainOwner,
    },
    {
        label: KMenuLabelCircleConfiguration,
        icon: iconScCircle,
        isAlt: true,
        accessMask: KRoleGlobalOwner | KRoleSupplyChainOwner,
    },
    {
        label: KMenuLabelLogOut,
        icon: iconLogout,
        isAlt: true,
        accessMask: KRoleNone,
        showIfAuthenticated: true,
    },
    {
        label: KMenuLabelLogIn,
        icon: iconLogin,
        isAlt: true,
        accessMask: KRoleNone,
        showIfUnauthenticated: true,
    }
];
