import { createAppSlice } from "@sbssrc/app/createAppSlice";
import { KApiStatusFulfilled, KBannerHeightMin } from "@sbssrc/utils/commonConstants";
import type {
    BaseSliceState,
    CommonError} from "@sbssrc/utils/commonTypes";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface MainSliceState extends BaseSliceState {
    accessToken: string | null;
    commonErrors: CommonError[];
    pickerOpen: boolean | null;
    isClean: boolean;
    username: string | null; // Returned from Entra ID
    bannerHeight: number;
}

const initialState: MainSliceState = {
    loading: false,
    status: KApiStatusFulfilled,
    accessToken: null,
    commonErrors: [],
    pickerOpen: false,
    isClean: true,
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
        actionSetPickerOpen: create.reducer(
            (state, action: PayloadAction<boolean | null>) => {
                state.pickerOpen = action.payload;
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
        selectCommonErrors: state => state.commonErrors,
        selectPickerOpen: state => state.pickerOpen,
        selectUsername: state => state.username,
        selectBannerHeight: state => state.bannerHeight,
    },
});

// Action creators are generated for each case reducer function.
export const {
    actionSetAccessToken,
    actionSetMainIsLoading,
    actionSetCommonError,
    actionClearCommonError,
    actionSetPickerOpen,
    actionSetUsername,
    actionSetBannerHeight,
} = mainSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectMainIsLoading,
    selectAccessToken,
    selectCommonErrors,
    selectPickerOpen,
    selectUsername,
    selectBannerHeight,
} = mainSlice.selectors;
