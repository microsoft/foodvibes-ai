import { GetRolesActive } from "@foodvibes/utils/commonFunctions";
import { IconButtonAddReplace } from "@foodvibes/utils/commonStyles";
import { Box } from "@mui/material";
import clsx from "clsx";

const BadgeEntry = ({ label, value, title, }: { label: string | null; value: string | null; title: string }) => (
    <Box component="div" sx={{ cursor: "help", whiteSpace: "nowrap", height: "16px", padding: "2px 0 0 0" }} title={title}>
        {label &&
            <Box component="span" sx={{ width: "96px", fontWeight: 200, display: "inline-block" }}>
                {label}:
            </Box>
        }
        <Box component="span" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
            {value}
        </Box>
    </Box>
);

export const FvIdBadge = (
    {
        forceShowAll = false,
        assumedUsername = null,
        assumedAccessMask = null,
        preferredUsername = null,
        preferredAccessMask = null,
        username = null,
        restoreAlias = null,
    }: {
        forceShowAll?: boolean;
        assumedUsername?: string | null;
        assumedAccessMask?: number | null;
        preferredUsername?: string | null;
        preferredAccessMask?: number | null;
        username?: string | null;
        restoreAlias?: (() => void) | null;
    }
) => <>
        {forceShowAll &&
            <Box component="div" className={clsx("App-profile", username ? "" : "App-profile")}>
                Profile {assumedUsername !== preferredUsername &&
                    <IconButtonAddReplace size="small"
                        edge="start"
                        color="inherit"
                        aria-label="action"
                        sx={{ mr: 1, position: "absolute", top: "9px", right: "4px" }}
                        id="action-button"
                        aria-haspopup="false"
                        title={"Restore EI Alias and Access Mask"}
                        onClick={() => {
                            restoreAlias && restoreAlias();
                        }}
                    >
                        Restore Alias
                    </IconButtonAddReplace>
                }
            </Box>
        }
        {(forceShowAll || assumedUsername || assumedAccessMask || preferredUsername || preferredAccessMask || username) &&
            <Box component="span" className={clsx("App-profile-body", forceShowAll ? "App-profile-body1" : "App-profile-body2")}>
                {(forceShowAll || username) ?
                    <BadgeEntry label={forceShowAll ? "EI Username" : null} value={username} title={"Entra ID username"} /> : null}
                {(forceShowAll || preferredUsername) ?
                    <BadgeEntry label={forceShowAll ? "EI Alias" : null} value={preferredUsername} title={"Entra ID preferred username"} /> : null}
                {(forceShowAll || preferredAccessMask) ?
                    <BadgeEntry label={forceShowAll ? "EI Access Mask" : null} value={GetRolesActive(preferredAccessMask ?? 0)} title={"Entra ID-based permission mask"} /> : null}
                {(forceShowAll || assumedUsername) ?
                    <BadgeEntry label={forceShowAll ? "Alias" : null} value={assumedUsername} title={"Assumed/Impersonated username"} /> : null}
                <BadgeEntry label={forceShowAll ? "Access Mask" : null} value={`${assumedAccessMask ?? 0} (${GetRolesActive(assumedAccessMask ?? 0)})`} title={"Assumed/Impersonated username-based permission mask"} />
            </Box>
        }
    </>
    ;
