import {
    Box,
    FormControlLabel,
    Grid,
    IconButton,
    Input,
    Typography,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import { styled } from "@mui/material/styles";

export const StyledIconButtonBase = styled(IconButton)(() => ({
    backgroundColor: "navy",
    color: "white",
    fontWeight: "bold",
    borderRadius: "8px",
    padding: "6px",
    margin: "0 6px 0 0",
    border: "1px solid gray",
    ":hover": {
        backgroundColor: "navy",
        // color: "yellow",
        // borderColor: "red",
    },
}));

export const IconButtonRefresh = styled(StyledIconButtonBase)(() => ({
    backgroundColor: "green",
    ":hover": {
        backgroundColor: "green",
    },
}));

export const IconButtonAddNew = styled(StyledIconButtonBase)(() => ({
    backgroundColor: "#1976d2",
    ":hover": {
        backgroundColor: "#1976d2",
    },
}));

export const IconButtonAddReplace = styled(IconButton)(() => ({
    backgroundColor: "#1976d2",
    color: "white",
    fontWeight: "normal",
    borderRadius: "4px",
    padding: "1px 6px",
    margin: "2px 0 0 0",
    border: "1px solid gray",
    fontSize: "12.5px",
    ":hover": {
        backgroundColor: "#1976d2",
    },
}));

export const IconButtonSave = styled(IconButton)(() => ({
    backgroundColor: "#1976d2",
    color: "white",
    fontWeight: "normal",
    borderRadius: "4px",
    padding: "1px 6px",
    margin: "0",
    border: "1px solid gray",
    fontSize: "17.5px",
    ":hover": {
        color: "white",
        backgroundColor: "navy",
    },
}));

export const IconButtonNonSave = styled(IconButtonSave)(() => ({
    backgroundColor: "white",
    color: "green",
}));

export const StyledIconButton1GridRow = styled(IconButtonNonSave)(() => ({
    height: "20px",
    width: "20px",
    border: "0",
    margin: "0 2px",
    color: "royalblue",
    backgroundColor: "inherit",
    ":hover": {
        color: "navy",
        backgroundColor: "inherit",
    },
}));
export const StyledIconButton2GridRow = styled(StyledIconButton1GridRow)(
    () => ({
        color: "green",
    }),
);
export const StyledIconButton3GridRow = styled(StyledIconButton1GridRow)(
    () => ({
        color: "brown",
    }),
);

export const StyledCard = styled(Card)(({ theme }) => ({
    border: "1px solid silver",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    ...theme.typography.body2,
    margin: "0",
    padding: "0",
    textAlign: "left",
    color: theme.palette.text.secondary,
    minWidth: "250px",
}));

export const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
    border: "0",
    borderRadius: "8px 8px 0 0",
    margin: "0",
    backgroundColor: "#bbbbbb",
    ...theme.typography.body2,
    padding: "0",
    textAlign: "left",
    color: theme.palette.text.primary,
}));

export const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: "31px",
    width: "31px",
    position: "relative",
    left: "3px",
    top: "0",
    transform: "scale(1.0)",
    margin: "0",
    padding: "0",
    borderRadius: "100px",
}));

export const StyledCardSubtitleContent = styled(Box)(() => ({
    overflow: "hidden",
    textOverflow: "ellipsis",
    position: "absolute",
    left: "16px",
    zIndex: 100,
}));

export const StyledCardSubtitleContentImg = styled(Box)(() => ({
    padding: "6px 0 0 6px",
    zIndex: 100,
}));

export const StyledCardSubtitle = styled(Box)(({ theme }) => ({
    margin: "0",
    padding: "0",
    fontSize: "0.7rem",
    fontWeight: "bold",
    fontFamily: "tahoma,arial,sans-serif",
    color: theme.palette.mode === "dark" ? "#ffffff" : "#1a2027",
    whiteSpace: "nowrap",
}));

export const StyledCardSubtitleTall = styled(StyledCardSubtitle)(() => ({
    height: "40px",
    padding: "0 0 0 12px",
}));

export const StyledSliderLabel = styled(Box)(() => ({
    display: "block",
    height: "20px",
}));

export const StyledCardTitle = styled(Box)(({ theme }) => ({
    margin: "0",
    padding: "0",
    fontSize: "0.7rem",
    fontFamily: "tahoma,arial,sans-serif",
    whiteSpace: "nowrap",
    fontWeight: "boldest",
    color: theme.palette.mode === "dark" ? "#ffffff" : "#444444",
}));

export const StyledCardContent = styled(CardContent)(() => ({
    margin: "0",
    padding: "0",
}));

export const StyleGridContainer = styled(Grid)(({ theme }) => ({
    margin: "0",
    padding: "0",
    borderRadius: "0",
    border: "1px solid silver",
    backgroundColor: "#ffffff",
}));

export const StyledGridItem = styled(Grid)(({ theme }) => ({
    margin: "0",
    padding: "0",
    fontSize: "0.7rem",
    fontWeight: "bold",
    cursor: "default",
    color: theme.palette.mode === "dark" ? "#ffffff" : "#1a2027",
    fontFamily: "tahoma,arial,sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
}));

export const StyledGridItemLabel = styled(StyledGridItem)(() => ({
    fontWeight: "lighter",
}));

export const StyledGridItemNoLabel = styled(StyledGridItem)(() => ({
    margin: "0 0 4px 0",
    padding: "0",
    fontSize: "0.8rem",
    textAlign: "center",
    backgroundColor: "white",
    border: "1px solid #cdcdcd",
    borderRadius: "4px",
}));

export const SubTitle = styled(Typography)(() => ({
    fontSize: "1.0rem",
    borderRadius: "4px",
    backgroundColor: "inherit",
    color: "black",
    fontWeight: "bold",
    fontFamily: "tahoma,arial,sans-serif",
    whiteSpace: "nowrap",
    display: "inline-flex",
    textAlign: "left",
    padding: "2px 6px",
    margin: "0",
    height: "28px",
    lineHeight: "28px",
}));

export const StyledSwitchContainer = styled(FormControlLabel)(() => ({
    padding: "0",
    margin: "4px 0",
    height: "24px",
}));

export const StyledSwitchLabel = styled(Box)(() => ({
    margin: "0",
    padding: "0",
    fontSize: "0.7rem",
    fontWeight: "bold",
    fontFamily: "tahoma,arial,sans-serif",
    color: "#1a2027",
    whiteSpace: "nowrap",
}));

export const StyledRequiredLabel = styled(Box)(() => ({
    margin: "4px",
    padding: "1px 6px 2px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    fontFamily: "tahoma,arial,sans-serif",
    color: "red",
    backgroundColor: "white",
    whiteSpace: "nowrap",
    position: "relative",
    top: "2px",
    cursor: "default",
}));
export const StyledHistoryPointsSubtitle = styled(Box)(() => ({
    margin: "0",
    padding: "0 6px 0 0",
    fontSize: "0.7rem",
    fontWeight: "bold",
    fontFamily: "tahoma,arial,sans-serif",
    whiteSpace: "wrap",
    position: "relative",
    top: "0",
    cursor: "default",
    color: "#888888",
}));
export const StyledHistoryPoints = styled(StyledHistoryPointsSubtitle)(() => ({
    color: "navy",
    fontSize: "0.8rem",
    backgroundColor: "ghostwhite",
    whiteSpace: "nowrap",
    padding: "0 6px",
    border: "0.5px dotted silver",
    textAlign: "left",
    display: "inline-flex",
}));

export const StyledHiddenInput = styled(Input)(() => ({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
}));
