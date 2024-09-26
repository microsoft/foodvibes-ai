
import {
    StyleGridContainer,
    StyledGridItem,
} from "@foodvibes/utils/commonStyles";
import {
    CommonDetailLevel,
    CommonGridSizes,
    ScCircleType,
    ScGroupType,
    ScUserType,
} from "@foodvibes/utils/commonTypes";
import FvCardScCircle from "./FvCardScCircle";
import FvCardScGroup from "./FvCardScGroup";
import FvCardScUser from "./FvCardScUser";

const gridSizes: CommonGridSizes[] = [
    {
        // Min [trakingScUser tile, sc_user tile, sc_group tile]
        xl: [4, 4, 4],
        lg: [4, 4, 4],
        md: [4, 4, 4],
        sm: [4, 4, 4],
        xs: [12, 12, 12],
    },
    {
        // Low
        xl: [4, 4, 4],
        lg: [4, 4, 4],
        md: [4, 4, 4],
        sm: [4, 4, 4],
        xs: [12, 12, 12],
    },
    {
        // High
        xl: [4, 4, 4],
        lg: [4, 4, 4],
        md: [4, 4, 4],
        sm: [6, 6, 12],
        xs: [12, 12, 12],
    },
    {
        // Max
        xl: [4, 4, 4],
        lg: [4, 4, 4],
        md: [4, 4, 4],
        sm: [6, 6, 12],
        xs: [12, 12, 12],
    },
];

const getGridSize = (
    isModal: boolean,
    detailLevel: CommonDetailLevel,
    idx: number,
) => {
    if (isModal) {
        return {
            xs: 12,
        };
    } else {
        return {
            xl: gridSizes[detailLevel].xl[idx],
            lg: gridSizes[detailLevel].lg[idx],
            md: gridSizes[detailLevel].md[idx],
            sm: gridSizes[detailLevel].sm[idx],
            xs: gridSizes[detailLevel].xs[idx],
        };
    }
};

const populateScUserFromScCircle = (
    r: ScCircleType,
): ScUserType =>
    ({
        orm_id: 0,
        is_history: r.sc_user_is_history ? true : false,
        sc_user_ledger_id: r.sc_user_ledger_id,
        sc_user_tx_id: r.sc_user_tx_id,
        sc_user_id: r.sc_user_id,
        email_addr: r.email_addr,
        phone: r.phone,
        access_mask: r.sc_user_access_mask,
        active_roles: r.sc_user_active_roles,
        active_roles_long: r.sc_user_active_roles_long,
        operation_name: r.sc_user_operation_name,
        created_at: r.sc_user_created_at,
        username: r.sc_user_username,
    }) as ScUserType;

const populateScGroupFromScCircle = (
    r: ScCircleType,
): ScGroupType =>
    ({
        orm_id: 0,
        is_history: r.sc_group_is_history ? true : false,
        sc_group_ledger_id: r.sc_group_ledger_id,
        sc_group_tx_id: r.sc_group_tx_id,
        sc_group_id: r.sc_group_id,
        description: r.sc_group_description,
        operation_name: r.sc_group_operation_name,
        created_at: r.sc_group_created_at,
        username: r.sc_group_username,
    }) as ScGroupType;

export default function FvScCircleEntryTile({
    rec,
    cnt,
    idx,
    ledgerIdToView,
    isModal,
    isTile,
    detailLevel,
    scrollToRef,
}: {
    rec: ScCircleType;
    cnt: number;
    idx: number;
    ledgerIdToView: number;
    isModal: boolean;
    isTile: boolean;
    detailLevel: CommonDetailLevel;
    scrollToRef: React.MutableRefObject<null> | null;
}): JSX.Element | undefined {
    if (!rec) {
        return;
    }

    return (
        <StyleGridContainer
            container
            spacing={0}
            sx={{
                margin: `${idx > 0 || isTile ? 0 : 0}px 0 0 0`,
                border: isModal && detailLevel === CommonDetailLevel.min ? "0" : {},
                borderRadius: `${detailLevel > CommonDetailLevel.low && !isModal ? 8 : 0}px`,
            }}
        >
            <StyledGridItem
                item
                ref={rec.sc_circle_ledger_id === ledgerIdToView ? scrollToRef : null}
                {...getGridSize(isModal, detailLevel, 0)}
            >
                <FvCardScCircle
                    data={rec}
                    idx={idx}
                    cnt={cnt}
                    detailLevel={detailLevel}
                    isModal={isModal}
                    isTile={isTile}
                />
            </StyledGridItem>
            <StyledGridItem
                item
                {...getGridSize(isModal, detailLevel, 1)}
            >
                <FvCardScGroup
                    data={populateScGroupFromScCircle(rec)}
                    detailLevel={detailLevel}
                    isModal={isModal}
                    isTile={isTile}
                />
            </StyledGridItem>
            <StyledGridItem
                item
                {...getGridSize(isModal, detailLevel, 2)}
            >
                <FvCardScUser
                    data={populateScUserFromScCircle(rec)}
                    detailLevel={detailLevel}
                    isModal={isModal}
                    isTile={isTile}
                />
            </StyledGridItem>
        </StyleGridContainer>
    );
}
