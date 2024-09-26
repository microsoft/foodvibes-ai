import { DialogTitle } from "@mui/material";
import Box from "@mui/material/Box";

export const GetDialogTitleInner = (
    prefix: string,
    icon: string,
    label: string,
) => (
    <Box component="span" sx={{ whiteSpace: "nowrap", display: "block" }}>
        <Box
            component="span"
            sx={{
                whiteSpace: "nowrap",
                display: "inline-block",
                margin: "0 6px 0 0",
            }}
        >
            <img
                src={icon}
                alt={label}
                style={{ height: "20px", position: "relative", top: "3px" }}
            />
        </Box>
        <Box
            component="span"
            sx={{
                whiteSpace: "nowrap",
                display: "inline-block",
                lineHeight: "20px",
                fontWeight: "bold",
            }}
        >
            {prefix}
            {label}
        </Box>
    </Box>
);

export const GetDialogTitle = (prefix: string, icon: string, label: string) => (
    <DialogTitle variant="subtitle1">
        {GetDialogTitleInner(prefix, icon, label)}
    </DialogTitle>
);
