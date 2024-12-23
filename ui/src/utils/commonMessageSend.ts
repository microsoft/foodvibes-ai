import { useAppDispatch } from "@sbssrc/app/hooks";
import { actionSetCommonError } from "@sbssrc/app/mainSlice";
import { CommonError } from "@sbssrc/utils/commonTypes";
import { MakeErrorPayload } from "./commonFunctions";

export default function CommonMessageSend(
    dispatch?: (arg0: {
        payload: CommonError;
        type: "main/actionSetCommonError";
    }) => void,
    payload?: CommonError,
) {
    let dispatchToUse = dispatch;

    if (!dispatchToUse) {
        dispatchToUse = useAppDispatch();
    }

    dispatchToUse(
        actionSetCommonError({
            ...MakeErrorPayload(),
            ...payload,
        }),
    );
}
