import { useAppDispatch, useAppSelector } from "@foodvibes/app/hooks";
import {
    actionSetActiveCardType,
    actionSetEditorOpen,
    actionSetPickerOpen,
    selectActiveCardType,
    selectAssumedAccessMask,
    selectBannerHeight,
    selectBookmarkedScGroup,
    selectBookmarkedScUser,
    selectEditorOpen,
    selectPickerOpen
} from "@foodvibes/app/mainSlice";
import {
    actionSetDetailLevelB,
    selectDetailLevelB
} from "@foodvibes/features/product/productSlice";
import {
    selectScCircleResponse,
} from "@foodvibes/features/scCircle/scCircleSlice";
import type {
    CommonCardType,
    CommonDetailLevel,
    EditFieldsType,
    QueryResponseType,
    ScCircleType,
    ScGroupType,
    ScUserType
} from "@foodvibes/utils/commonTypes";
import { FvCommonModalPicker } from "./FvCommonModalPicker";
import { FvScCircleModalEdit } from "./FvScCircleModalAll/FvScCircleModalEdit";

export const FvScCircleModalAll = ({
    isClean = true,
    upsertScCircle = () => { },
    editFields = null,
    setEditFields = () => { },
}: {
    isClean?: boolean;
    upsertScCircle?: (keepEditorOpenNew: boolean, saveAsNew?: boolean, softDeleted?: boolean) => void;
    editFields?: EditFieldsType | null;
    setEditFields?: (payload: EditFieldsType | null) => void;
}) => {
    const dispatch = useAppDispatch();
    const assumedAccessMask: number | null = useAppSelector(selectAssumedAccessMask);
    const bookmarkedScGroup: ScGroupType | null = useAppSelector(selectBookmarkedScGroup);
    const bookmarkedScUser: ScUserType | null = useAppSelector(selectBookmarkedScUser);
    const currActiveCardType: CommonCardType | null = useAppSelector(selectActiveCardType);
    const detailLevelB: CommonDetailLevel = useAppSelector(selectDetailLevelB);
    const isEditorOpen: boolean = useAppSelector(selectEditorOpen) ?? false;
    const isPickerOpen: boolean = useAppSelector(selectPickerOpen) ?? false;
    const scCircleResponse: QueryResponseType<ScCircleType> = useAppSelector(selectScCircleResponse);
    const bannerHeight: number = useAppSelector(selectBannerHeight);
    const setActiveCardType = (payload: CommonCardType) => dispatch(actionSetActiveCardType(payload));
    const setDetailLevelB = (detailLevel: CommonDetailLevel) => dispatch(actionSetDetailLevelB(detailLevel));
    const setEditorOpen = (payload: boolean) => dispatch(actionSetEditorOpen(payload));
    const setPickerOpen = (payload: boolean) => dispatch(actionSetPickerOpen(payload));

    return (
        <>
            <FvScCircleModalEdit
                bookmarkedScGroup={bookmarkedScGroup}
                bookmarkedScUser={bookmarkedScUser}
                isClean={isClean}
                data={scCircleResponse.reportData ?? []}
                detailLevelB={detailLevelB}
                editFields={editFields}
                isEditorOpen={isEditorOpen}
                setActiveCardType={setActiveCardType}
                setDetailLevelB={setDetailLevelB}
                setEditFields={setEditFields}
                setEditorOpen={setEditorOpen}
                setPickerOpen={setPickerOpen}
                upsert={upsertScCircle}
                allowDelete={true}
                bannerHeight={bannerHeight}
            />

            <FvCommonModalPicker
                currActiveCardType={currActiveCardType}
                readOnly={true}
                isPickerOpen={isPickerOpen}
                setPickerOpen={setPickerOpen}
            />
        </>
    );
};
