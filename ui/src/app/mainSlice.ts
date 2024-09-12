import { createAppSlice } from "@foodvibes/app/createAppSlice";
import { KApiStatusFulfilled, KApiStatusPending, KApiStatusRejected, KBannerHeightMin } from "@foodvibes/utils/commonConstants";
import { CompareObjects, ComposeHttpHeaders, ComposeUrl, ComposeUrlImage, MakeErrorPayload } from "@foodvibes/utils/commonFunctions";
import type {
    BaseSliceState,
    CommonCardType,
    CommonError,
    CommonScCircleType,
    EditFieldsType,
    GeotrackType,
    ProductType,
    ScCircleType,
    ScGroupType,
    ScUserType,
    TrackingProductsType,
    UploadImageType
} from "@foodvibes/utils/commonTypes";
import {
    CommonErrorLevel,
} from "@foodvibes/utils/commonTypes";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface MainSliceState extends BaseSliceState {
    accessToken: string | null;
    activeCardType: CommonCardType | null;
    activeTabName: string | null;
    allowedScUserList: ScUserType[] | null;
    allowedScGroupList: ScGroupType[] | null;
    bookmarkedScUser: ScUserType | null;
    bookmarkedScGroup: ScGroupType | null;
    bookmarkedScCircle: ScCircleType | null;
    bookmarkedGeotrack: GeotrackType | null;
    bookmarkedProduct: ProductType | null;
    bookmarkedTrackingProducts: TrackingProductsType | null;
    commonErrors: CommonError[];
    editorOpen: boolean | null;
    editorOpen2: boolean | null;
    pickerOpen: boolean | null;
    modalOpenTrackingProductsReadOnly: boolean | null;
    modalOpenTrackingProductsHistory: boolean | null;
    modalOpenScCircleReadOnly: boolean | null;
    modalOpenScCircleHistory: boolean | null;
    pickerOpenLedger: boolean | null;
    mapsApiKey: string | null;
    mapsEngineIsReady: boolean | null;
    uploadedFileUrl: string | null;
    editFields: EditFieldsType;
    isClean: boolean;
    assumedUsername: string | null;
    assumedAccessMask: number | null;
    assumedGroups: CommonScCircleType[] | null;
    preferredUsername: string | null; // Returned from Entra ID
    preferredAccessMask: number | null; // Coupled with preferredUsername access_mask
    username: string | null; // Returned from Entra ID
    bannerHeight: number;
}

const initialState: MainSliceState = {
    loading: false,
    status: KApiStatusFulfilled,
    accessToken: null,
    activeCardType: null,
    activeTabName: null,
    allowedScUserList: null,
    allowedScGroupList: null,
    bookmarkedScUser: null,
    bookmarkedScGroup: null,
    bookmarkedScCircle: null,
    bookmarkedGeotrack: null,
    bookmarkedProduct: null,
    bookmarkedTrackingProducts: null,
    commonErrors: [],
    editorOpen: false,
    editorOpen2: false,
    pickerOpen: false,
    modalOpenTrackingProductsReadOnly: false,
    modalOpenTrackingProductsHistory: false,
    modalOpenScCircleReadOnly: false,
    modalOpenScCircleHistory: false,
    pickerOpenLedger: false,
    mapsApiKey: null,
    mapsEngineIsReady: null,
    uploadedFileUrl: null,
    editFields: {
        current: {},
        incoming: {},
    },
    isClean: true,
    assumedUsername: null,
    assumedAccessMask: null,
    assumedGroups: null,
    preferredUsername: null,
    preferredAccessMask: null,
    username: null,
    bannerHeight: KBannerHeightMin,
};

export const mainSlice = createAppSlice({
    name: "main",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: create => ({
        // Use the `PayloadAction` type to declare the contents of `action.payload`
        actionSetActiveCardType: create.reducer(
            (state, action: PayloadAction<CommonCardType | null>) => {
                state.activeCardType = action.payload;
            },
        ),
        actionSetActiveTabName: create.reducer(
            (state, action: PayloadAction<string | null>) => {
                state.activeTabName = action.payload;
            },
        ),
        actionSetAllowedScUserList: create.reducer(
            (state, action: PayloadAction<ScUserType[] | null>) => {
                state.allowedScUserList = action.payload;
            },
        ),
        actionSetAllowedScGroupList: create.reducer(
            (state, action: PayloadAction<ScGroupType[] | null>) => {
                state.allowedScGroupList = action.payload;
            },
        ),
        actionSetBookmarkedScUser: create.reducer(
            (state, action: PayloadAction<ScUserType | null>) => {
                state.bookmarkedScUser = action.payload;

                if (action.payload) {
                    state.commonErrors.push(
                        MakeErrorPayload(
                            0,
                            CommonErrorLevel.information,
                            `Bookmarked ScUser ID "${action.payload?.sc_user_ledger_id}"`,
                        ),
                    );
                }
            },
        ),
        actionSetBookmarkedScGroup: create.reducer(
            (state, action: PayloadAction<ScGroupType | null>) => {
                state.bookmarkedScGroup = action.payload;

                if (action.payload) {
                    state.commonErrors.push(
                        MakeErrorPayload(
                            0,
                            CommonErrorLevel.information,
                            `Bookmarked ScGroup ID "${action.payload?.sc_group_ledger_id}"`,
                        ),
                    );
                }
            },
        ),
        actionSetBookmarkedScCircle: create.reducer(
            (state, action: PayloadAction<ScCircleType | null>) => {
                state.bookmarkedScCircle = action.payload;

                if (action.payload) {
                    state.commonErrors.push(
                        MakeErrorPayload(
                            0,
                            CommonErrorLevel.information,
                            `Bookmarked ScCircle ID "${action.payload?.sc_circle_ledger_id}"`,
                        ),
                    );
                }
            },
        ),
        actionSetBookmarkedGeotrack: create.reducer(
            (state, action: PayloadAction<GeotrackType | null>) => {
                state.bookmarkedGeotrack = action.payload;

                if (action.payload) {
                    state.commonErrors.push(
                        MakeErrorPayload(
                            0,
                            CommonErrorLevel.information,
                            `Bookmarked GeoTrack ID "${action.payload?.geotrack_id}"`,
                        ),
                    );
                }
            },
        ),
        actionSetBookmarkedProduct: create.reducer(
            (state, action: PayloadAction<ProductType | null>) => {
                state.bookmarkedProduct = action.payload;
                if (action.payload) {
                    state.commonErrors.push(
                        MakeErrorPayload(
                            0,
                            CommonErrorLevel.information,
                            `Bookmarked Product ID "${action.payload?.product_id}"`,
                        ),
                    );
                }
            },
        ),
        actionSetBookmarkedTrackingProducts: create.reducer(
            (state, action: PayloadAction<TrackingProductsType | null>) => {
                state.bookmarkedTrackingProducts = action.payload;
                if (action.payload) {
                    state.commonErrors.push(
                        MakeErrorPayload(
                            0,
                            CommonErrorLevel.information,
                            `Bookmarked TrackingProducts Ledger ID "${action.payload?.tracking_products_ledger_id}"`,
                        ),
                    );
                }
            },
        ),
        actionSetCommonError: create.reducer(
            (state, action: PayloadAction<CommonError>) => {
                if (action.payload) {
                    state.commonErrors.push(action.payload);
                } else {
                    state.commonErrors = [];
                }
            },
        ),
        actionClearCommonError: create.reducer(
            (state, action: PayloadAction<number>) => {
                if (action.payload) {
                    state.commonErrors = state.commonErrors.slice(
                        action.payload,
                    );
                } else {
                    state.commonErrors = [];
                }
            },
        ),
        actionSetEditorOpen: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.editorOpen = action.payload;
            },
        ),
        actionSetEditorOpen2: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.editorOpen2 = action.payload;
            },
        ),
        actionSetPickerOpen: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.pickerOpen = action.payload;
            },
        ),
        actionSetModalOpenTrackingProductsReadOnly: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.modalOpenTrackingProductsReadOnly = action.payload;
            },
        ),
        actionSetModalOpenTrackingProductsHistory: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.modalOpenTrackingProductsHistory = action.payload;
            },
        ),
        actionSetModalOpenScCircleReadOnly: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.modalOpenScCircleReadOnly = action.payload;
            },
        ),
        actionSetModalOpenScCircleHistory: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.modalOpenScCircleHistory = action.payload;
            },
        ),
        actionSetPickerOpenLedger: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.pickerOpenLedger = action.payload;
            },
        ),
        actionSetMapsEngineIsReady: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.mapsEngineIsReady = action.payload;
            },
        ),
        actionUploadedFileUrlReset: create.reducer(
            (state) => {
                state.uploadedFileUrl = null;
            },
        ),
        actionSetEditFields: create.reducer(
            (state, action: PayloadAction<EditFieldsType | null>) => {
                if (action.payload === null) {
                    state.editFields.current = {};
                    state.editFields.incoming = {};
                } else if (Object.keys(state.editFields.current ?? {}).length || Object.keys(action.payload?.current ?? {}).length) {
                    // Update only the current fields are not empty
                    state.editFields = {
                        ...state.editFields,
                        current: {
                            ...state.editFields?.current,
                            ...action.payload?.current,
                        },
                        incoming: {
                            ...state.editFields?.incoming,
                            ...action.payload?.incoming,
                        },
                    }
                }

                state.isClean = CompareObjects(state.editFields.current, state.editFields.incoming);
            },
        ),
        actionSetIsClean: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.isClean = action.payload;
            },
        ),
        actionSetAssumedUsername: create.reducer(
            (state, action: PayloadAction<string | null>) => {
                state.assumedUsername = action.payload;
            },
        ),
        actionSetAssumedAccessMask: create.reducer(
            (state, action: PayloadAction<number | null>) => {
                state.assumedAccessMask = action.payload;

                if (!state.preferredAccessMask) {
                    state.preferredAccessMask = action.payload; // Set once per session and used for managing menu items in case user impersonates another user
                }
            },
        ),
        actionSetAssumedGroups: create.reducer(
            (state, action: PayloadAction<CommonScCircleType[] | null>) => {
                state.assumedGroups = action.payload;
            },
        ),
        actionSetPreferredUsername: create.reducer(
            (state, action: PayloadAction<string | null>) => {
                state.preferredUsername = action.payload;
            },
        ),
        actionSetUsername: create.reducer(
            (state, action: PayloadAction<string | null>) => {
                state.username = action.payload;
            },
        ),
        actionSetBannerHeight: create.reducer(
            (state, action: PayloadAction<number>) => {
                state.bannerHeight = action.payload;
            },
        ),
        // The function below is called a thunk and allows us to perform async logic. It
        // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
        // will call the thunk with the `dispatch` function as the first argument. Async
        // code can then be executed and other actions can be dispatched. Thunks are
        // typically used to make async requests.
        actionSetMapsApiKey: create.asyncThunk(
            async (accessToken: string | null, { dispatch }) => {
                const response = await axios
                    .get(ComposeUrl("map_key"), ComposeHttpHeaders(accessToken))
                    .then(async res => {
                        return res.data as string;
                        // Ignore .catch() here to allow slice rejected() handle errors
                    });
                return response;
            },
            {
                pending: state => {
                    state.loading = true;
                    state.status = KApiStatusPending;
                    state.mapsApiKey = null;
                },
                fulfilled: (state, action) => {
                    state.status = KApiStatusFulfilled;
                    state.mapsApiKey = action.payload;
                    state.loading = false;
                },
                rejected: state => {
                    state.status = KApiStatusRejected;
                    state.commonErrors.push(
                        MakeErrorPayload(
                            1,
                            CommonErrorLevel.warning,
                            "Failed to load map api key",
                        ),
                    );
                    state.loading = false;
                },
            },
        ),
        actionUploadImage: create.asyncThunk(
            async ({ uploadImage, accessToken, }: { uploadImage: UploadImageType; accessToken: string | null; }, { dispatch }) => {
                const formData = new FormData();

                formData.append('file', uploadImage.fileObj);
                formData.append('fileName', uploadImage.fileName);
                const config = {
                    headers: {
                        ...ComposeHttpHeaders(accessToken).headers,
                        'content-type': 'multipart/form-data',
                    },
                };
                const response = await axios
                    .post(ComposeUrlImage("upload_image", uploadImage.fileName, uploadImage.isProduct, uploadImage.contentType), formData, config)
                    .then(async res => {
                        return res.data as string;
                        // Ignore .catch() here to allow slice rejected() handle errors
                    });
                return response;
            },
            {
                pending: state => {
                    state.loading = true;
                    state.status = KApiStatusPending;
                    state.uploadedFileUrl = null;
                },
                fulfilled: (state, action) => {
                    state.status = KApiStatusFulfilled;
                    state.uploadedFileUrl = action.payload;
                    state.loading = false;
                },
                rejected: state => {
                    state.status = KApiStatusRejected;
                    state.commonErrors.push(
                        MakeErrorPayload(
                            1,
                            CommonErrorLevel.warning,
                            "Failed to upload file",
                        ),
                    );
                    state.loading = false;
                },
            },
        ),
        actionSetAccessToken: create.reducer(
            (state, action: PayloadAction<string>) => {
                state.accessToken = action.payload;
            },
        ),
        actionSetMainIsLoading: create.reducer(
            (state, action: PayloadAction<boolean>) => {
                state.loading = action.payload;
            },
        ),
    }),
    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectMainIsLoading: state => state.loading,
        selectAccessToken: state => state.accessToken,
        selectActiveCardType: state => state.activeCardType,
        selectActiveTabName: state => state.activeTabName,
        selectAllowedScUserList: state => state.allowedScUserList,
        selectAllowedScGroupList: state => state.allowedScGroupList,
        selectBookmarkedScUser: state => state.bookmarkedScUser,
        selectBookmarkedScGroup: state => state.bookmarkedScGroup,
        selectBookmarkedScCircle: state => state.bookmarkedScCircle,
        selectBookmarkedGeotrack: state => state.bookmarkedGeotrack,
        selectBookmarkedProduct: state => state.bookmarkedProduct,
        selectBookmarkedTrackingProducts: state =>
            state.bookmarkedTrackingProducts,
        selectCommonErrors: state => state.commonErrors,
        selectEditorOpen: state => state.editorOpen,
        selectEditorOpen2: state => state.editorOpen2,
        selectPickerOpen: state => state.pickerOpen,
        selectModalOpenTrackingProductsReadOnly: state => state.modalOpenTrackingProductsReadOnly,
        selectModalOpenTrackingProductsHistory: state => state.modalOpenTrackingProductsHistory,
        selectModalOpenScCircleReadOnly: state => state.modalOpenScCircleReadOnly,
        selectModalOpenScCircleHistory: state => state.modalOpenScCircleHistory,
        selectPickerOpenLedger: state => state.pickerOpenLedger,
        selectMapsEngineIsReady: state => state.mapsEngineIsReady,
        selectMapsApiKey: state => state.mapsApiKey,
        selectUploadedFileUrl: state => state.uploadedFileUrl,
        selectEditFields: state => state.editFields,
        selectIsClean: state => state.isClean,
        selectAssumedUsername: state => state.assumedUsername,
        selectAssumedAccessMask: state => state.assumedAccessMask,
        selectAssumedGroups: state => state.assumedGroups,
        selectPreferredUsername: state => state.preferredUsername,
        selectPreferredAccessMask: state => state.preferredAccessMask,
        selectUsername: state => state.username,
        selectBannerHeight: state => state.bannerHeight,
    },
});

// Action creators are generated for each case reducer function.
export const {
    actionSetAccessToken,
    actionSetMainIsLoading,
    actionSetActiveCardType,
    actionSetActiveTabName,
    actionSetAllowedScUserList,
    actionSetAllowedScGroupList,
    actionSetBookmarkedScUser,
    actionSetBookmarkedScGroup,
    actionSetBookmarkedScCircle,
    actionSetBookmarkedGeotrack,
    actionSetBookmarkedProduct,
    actionSetBookmarkedTrackingProducts,
    actionSetCommonError,
    actionClearCommonError,
    actionSetEditorOpen,
    actionSetEditorOpen2,
    actionSetPickerOpen,
    actionSetModalOpenTrackingProductsReadOnly,
    actionSetModalOpenTrackingProductsHistory,
    actionSetModalOpenScCircleReadOnly,
    actionSetModalOpenScCircleHistory,
    actionSetPickerOpenLedger,
    actionSetMapsEngineIsReady,
    actionUploadedFileUrlReset,
    actionSetEditFields,
    actionSetIsClean,
    actionSetAssumedUsername,
    actionSetAssumedAccessMask,
    actionSetAssumedGroups,
    actionSetPreferredUsername,
    actionSetUsername,
    actionSetBannerHeight,
    actionSetMapsApiKey,
    actionUploadImage,
} = mainSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectMainIsLoading,
    selectAccessToken,
    selectActiveCardType,
    selectActiveTabName,
    selectAllowedScUserList,
    selectAllowedScGroupList,
    selectBookmarkedScUser,
    selectBookmarkedScGroup,
    selectBookmarkedScCircle,
    selectBookmarkedGeotrack,
    selectBookmarkedProduct,
    selectBookmarkedTrackingProducts,
    selectCommonErrors,
    selectEditorOpen,
    selectEditorOpen2,
    selectPickerOpen,
    selectModalOpenTrackingProductsReadOnly,
    selectModalOpenTrackingProductsHistory,
    selectModalOpenScCircleReadOnly,
    selectModalOpenScCircleHistory,
    selectPickerOpenLedger,
    selectMapsEngineIsReady,
    selectMapsApiKey,
    selectUploadedFileUrl,
    selectEditFields,
    selectIsClean,
    selectAssumedUsername,
    selectAssumedAccessMask,
    selectAssumedGroups,
    selectPreferredUsername,
    selectPreferredAccessMask,
    selectUsername,
    selectBannerHeight,
} = mainSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//     (amount: number): AppThunk =>
//         (dispatch, getState) => {
//             const currentValue = selectCount(getState())

//             if (currentValue % 2 === 1 || currentValue % 2 === -1) {
//                 dispatch(incrementByAmount(amount))
//             }
//         }
