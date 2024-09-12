import { useAppSelector } from "@foodvibes/app/hooks";
import { selectUsername } from "@foodvibes/app/mainSlice";
import flowDiagram from "@foodvibes/assets/flow-diagram.png";
import { FvLogin } from "@foodvibes/features/authorization/FvLogin";
import { Box } from "@mui/material";

export const FvHome = () => {
    const username: string | null = useAppSelector(selectUsername);
    const isAuthenticated: boolean = (username ?? "").length > 0;

    return (
        <Box component="div" sx={{ backgroundColor: "inherit", height: "calc(100vh)", position: "absolute" }}>
            {isAuthenticated ? null : <FvLogin />}
            <Box
                sx={{
                    textAlign: "center",
                    margin: "20px auto",
                    width: "calc(100vw)",
                    padding: "0 12px",
                }}
            >
                <img
                    src={flowDiagram}
                    alt="flow diagram"
                    style={{
                        textAlign: "center",
                        maxHeight: `calc(100vh - ${90 + (isAuthenticated ? 0 : 60)}px)`,
                        maxWidth: "calc(100vw - 60px)",
                    }}
                />
            </Box>
        </Box>
    );

};
