import { IPublicClientApplication, PublicClientApplication } from "@azure/msal-browser";
import { loginRequest } from "@foodvibes/services/authConfig";
import { jwtDecode } from 'jwt-decode';
import { createContext } from "react";

interface DecodedToken {
    exp: number;
}

export const MsalContext = createContext<PublicClientApplication | null>(null);

export async function GetAccessToken(
    instance: IPublicClientApplication
): Promise<string> {
    const activeAccount = instance.getActiveAccount();
    let accessToken: string = "";

    if (activeAccount) {
        // MSAL.js v2 exposes several account APIs, logic to determine which account to use is the responsibility of the developer
        const accessTokenRequest = {
            ...loginRequest,
            account: activeAccount,
        };

        // Use the same publicClientApplication instance provided to MsalProvider
        accessToken =
            (await instance
                .acquireTokenSilent(accessTokenRequest)
                .then(async function (accessTokenResponse) {
                    // Acquire token silent success
                    console.warn(`accessToken=${accessTokenResponse.accessToken.substring(0, 12)}...${accessTokenResponse.accessToken.substring(accessTokenResponse.accessToken.length - 12)}`);

                    return accessTokenResponse.accessToken;
                })
                .catch(function (error) {
                    //Acquire token silent failure
                    console.error(error);
                })) ?? "";
    }

    // console.warn("No active account was found.");

    return accessToken;
}

export async function RefreshAccessTokenIfNeeded(
    accessTokenCurr: string | null,
    instance: IPublicClientApplication
): Promise<string> {
    if (accessTokenCurr?.length) {
        const decodedToken = jwtDecode<DecodedToken>(accessTokenCurr);
        const currentTime = Date.now() / 1000; // Convert to seconds
        const timeRemaining = decodedToken.exp - currentTime;

        if (timeRemaining > 30) {
            return accessTokenCurr;
        }

        console.warn(`Time remaining on token: ${timeRemaining} seconds -- Triggering accessToken refresh...`);
    }

    return await GetAccessToken(instance);
}
