import { Dispatch } from "redux";
import {
    actionScanSessionsStreamStart,
    actionScanSessionsStreamSuccess,
    actionScanSessionsStreamError
} from "./productSlice";
import { ComposeUrl, QueryParamsInit } from "@foodvibes/utils/commonFunctions";


async function StreamData(dispatch: Dispatch, url: string, globalFilter: string) {
    dispatch(actionScanSessionsStreamStart());

    try {
        console.log(`Stream started for ${url} & ${globalFilter}`);

        const response = await fetch(ComposeUrl(url, QueryParamsInit({
            globalFilter,
        })));

        if (!response.body) {
            throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const decodedChunk = decoder.decode(value, { stream: true });
                console.log(decodedChunk);
                dispatch(actionScanSessionsStreamSuccess(decodedChunk));
            }
        }
    } catch (error: any) {
        dispatch(actionScanSessionsStreamError(error.message));
    }

    console.log('Stream ended');
    dispatch(actionScanSessionsStreamSuccess('Stream ended'));
};

export default StreamData;