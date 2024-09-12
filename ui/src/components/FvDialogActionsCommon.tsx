import {
    IconButtonNonSave,
    IconButtonSave
} from "@foodvibes/utils/commonStyles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from '@mui/icons-material/SaveAs';

export const FvDialogActionsCommon = <T,>({
    disabledSave,
    setEditorOpen,
    upsert,
    report,
    allowDelete,
    ledgerId = 0,
    canDoSaveAs = false,
}: {
    disabledSave: boolean;
    setEditorOpen: (payload: boolean) => void;
    upsert: (keepEditorOpenNew: boolean, saveAsNew?: boolean, softDeleted?: boolean) => void;
    report?: (row: T | null, ledgerId?: number) => void;
    allowDelete?: boolean;
    ledgerId?: number;
    canDoSaveAs?: boolean;
}) => (
    <>
        <IconButtonNonSave
            id="action-close-button"
            onClick={() => setEditorOpen(false)}
            title="Close popup"
        >
            <CloseIcon />
        </IconButtonNonSave>
        {report &&
            <IconButtonNonSave
                id="action-history-report-button"
                disabled={!ledgerId}
                onClick={() =>
                    report(null, ledgerId)
                }
                title="History Report"
            >
                <HistoryIcon />
            </IconButtonNonSave>
        }
        {allowDelete &&
            <IconButtonSave
                id="action-delete-button"
                disabled={!ledgerId}
                onClick={() => {
                    upsert(false, false, true);
                }}
                title="Delete entry & close popup"
            >
                <DeleteIcon />
                <CloseIcon />
            </IconButtonSave>
        }
        <IconButtonSave
            id="action-save-and-close-button"
            disabled={disabledSave}
            onClick={() => {
                upsert(false);
            }}
            title="Save entry & close popup"
        >
            <SaveIcon />
            <CloseIcon />
        </IconButtonSave>
        {canDoSaveAs &&
            <IconButtonSave
                id="action-save-button"
                disabled={disabledSave}
                onClick={() => {
                    upsert(true, true);
                }}
                title="Save as a new entry"
            >
                <SaveAsIcon />
            </IconButtonSave>
        }
        <IconButtonSave
            sx={{ mr: 2 }}
            id="action-save-button"
            disabled={disabledSave}
            onClick={() => {
                upsert(true);
            }}
            title="Save entry"
        >
            <SaveIcon />
        </IconButtonSave>
    </>
);