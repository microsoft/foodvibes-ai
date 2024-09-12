import { geotrackSlice } from "@foodvibes/features/geotrack/geotrackSlice";
import { productSlice } from "@foodvibes/features/product/productSlice";
import { scCircleSlice } from "@foodvibes/features/scCircle/scCircleSlice";
import { scGroupSlice } from "@foodvibes/features/scGroup/scGroupSlice";
import { scUserSlice } from "@foodvibes/features/scUser/scUserSlice";
import { trackingProductsSlice } from "@foodvibes/features/trackingProducts/trackingProductsSlice";
import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import logger from "redux-logger";
import { mainSlice } from "./mainSlice";

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(
    mainSlice,
    scUserSlice,
    scGroupSlice,
    scCircleSlice,
    geotrackSlice,
    productSlice,
    trackingProductsSlice,
);
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
    const store = configureStore({
        reducer: rootReducer,
        // Adding the api middleware enables caching, invalidation, polling,
        // and other useful features of `rtk-query`.
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Ignore these action types
                    // ignoredActions: ['main/actionInitMapsEngine'],
                    // Ignore these field paths in all actions since the object being set in the state is not serializable
                    // ignoredActionPaths: ['payload.mapsEngine',],
                    // Ignore these paths in the state since the object being set in the state is not serializable
                    // ignoredPaths: ['main.mapsEngine'],
                },
            }).concat(logger),
        preloadedState,
    });
    // configure listeners using the provided defaults
    // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
    setupListeners(store.dispatch);
    return store;
};

export const store = makeStore();

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
    ThunkReturnType,
    RootState,
    unknown,
    Action
>;
