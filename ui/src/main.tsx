// import React from "react";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { MsalContext } from "@foodvibes/services/authCommon";
import { MsalConfig } from "@foodvibes/services/authConfig";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { store } from "./app/store";
import "./index.css";
import { FvRouter } from "./routing/FvRouter";

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */

const msalInstance: PublicClientApplication = new PublicClientApplication(
    MsalConfig
);

// Default to using the first account if no account is active on page load
if (
    !msalInstance.getActiveAccount() &&
    msalInstance.getAllAccounts().length > 0
) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event) => {
    if (
        event.eventType === EventType.LOGIN_SUCCESS &&
        (event.payload as any)?.account
    ) {
        const account = (event.payload as any).account;
        msalInstance.setActiveAccount(account);
    }
});

const container: HTMLElement | null = document.getElementById("root");

if (container) {
    ReactDOM.createRoot(container).render(
        // <React.StrictMode>
        <Provider store={store}>
            <MsalContext.Provider value={msalInstance}>
                <RouterProvider router={FvRouter} />
            </MsalContext.Provider>
        </Provider>
        // </React.StrictMode>
    );
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file."
    );
}
