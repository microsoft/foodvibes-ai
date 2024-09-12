import { useAppDispatch } from "@foodvibes/app/hooks";
import { actionSetCommonError } from "@foodvibes/app/mainSlice";
import { CommonError } from "@foodvibes/utils/commonTypes";
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
