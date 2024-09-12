import { useSnackbar } from "notistack";

import { GetColorVariant } from "@foodvibes/utils/commonFunctions";
import { CommonError, CommonErrorLevel } from "@foodvibes/utils/commonTypes";
import { useEffect } from "react";

export default function FvMessageShow({
    clearErrorsCb,
    commonErrors,
}: {
    clearErrorsCb: (count: number) => void;
    commonErrors: CommonError[];
}) {
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (commonErrors.length) {
            commonErrors
                .filter(
                    e =>
                        !(
                            e.error_level === CommonErrorLevel.information ||
                            (e.error_level === CommonErrorLevel.success &&
                                e.message.includes("fetched") &&
                                !e.message.includes(" updated ") &&
                                !e.message.includes(" added "))
                        ),
                )
                .forEach(e => {
                    enqueueSnackbar(`${e.timestamp}> ${e.message}`, {
                        variant: GetColorVariant(e.error_level),
                        autoHideDuration:
                            e.error_level > CommonErrorLevel.information
                                ? e.error_level > CommonErrorLevel.warning
                                    ? 10000
                                    : 7000
                                : 4000,
                        anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    });
                });

            clearErrorsCb(commonErrors.length);
        }
    }, [commonErrors]);

    return <></>;
}
