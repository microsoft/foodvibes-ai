import FvDropdown from "@foodvibes/components/FvDropdown";
import { RoleChoices } from "@foodvibes/utils/commonLookups";
import {
    CommonCheckListType,
    EditFieldsType
} from "@foodvibes/utils/commonTypes";
import { useMemo } from "react";

export const FvScDropdownRoles = ({
    editFields,
    setEditFields,
}: {
    editFields: EditFieldsType | null;
    setEditFields: (payload: EditFieldsType | null) => void;
}) => {
    const rolesActive: CommonCheckListType[] = useMemo<CommonCheckListType[]>(() => RoleChoices.map(e => ({
        ...e,
        checked: e.value & (editFields?.current?.access_mask ?? 0) ? true : false
    })), [editFields?.current?.access_mask]);
    const setRolesActiveIncoming = (rolesIncoming: CommonCheckListType[]) => {
        let accessMask: number = 0;

        rolesActive.forEach((role) => {
            if (rolesIncoming.find((r) => r.id === role.id)?.checked) {
                accessMask += role.value;
            }
        });
        setEditFields({
            incoming: {
                access_mask: accessMask,
            }
        })
    };

    return <FvDropdown label={`Role(s) -- access mask = ${editFields?.incoming?.access_mask ?? 0}`} choicesCurr={rolesActive} setChoicesNew={setRolesActiveIncoming} />;
};
