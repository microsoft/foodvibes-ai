import { Dispatch } from "redux";
import {
    actionScanSessionsStreamStart,
    actionScanSessionsStreamSuccess,
    actionScanSessionsStreamError
} from "./productSlice";
import { ComposeUrl, QueryParamsInit } from "@foodvibes/utils/commonFunctions";


async function StreamData(dispatch: Dispatch, url: string) {
    dispatch(actionScanSessionsStreamStart());

    try {
        const response = await fetch(ComposeUrl(url, QueryParamsInit({})));

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

    console.log('Stream ended.');
};

export default StreamData;