import { makeStyles, TableCell, TableRow } from "@material-ui/core";
import { styled } from "@mui/system";

export const UseSbsStyles = makeStyles({
    tableContainer: {
        // maxHeight: 440,
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },
    stickyHeader2: {
        position: 'sticky',
        top: 33,
        zIndex: 2,
    },
    compactRow: {
        height: 24,
        verticalAlign: 'top',
    },
    compactCell: {
        padding: '4px 8px',
        width: '40%',
        verticalAlign: 'top',
        whiteSpace: "nowrap",
    },
    compactCell1: {
        padding: '4px 8px',
        width: '100%',
        verticalAlign: 'top',
    },
    compactCell1h: {
        padding: '4px 8px',
        width: '100%',
        verticalAlign: 'top',
        backgroundColor: '#e8e8e8',
    },
    compactCell2: {
        padding: '4px 8px',
        width: "360px",
        verticalAlign: 'top',
    },
    compactCell3: {
        padding: '4px 8px',
        maxWidth: "186px",
        minWidth: "186px",
        whiteSpace: "nowrap",
        verticalAlign: 'top',
        backgroundColor: 'lavenderblush',
    },
    compactCell3h: {
        padding: '4px 8px',
        maxWidth: "186px",
        minWidth: "186px",
        whiteSpace: "nowrap",
        verticalAlign: 'top',
        backgroundColor: '#e8e8e8',
    },
    compactNumericCell: {
        padding: '4px 8px',
        textAlign: 'right',
    },
    customOutlinedInputRoot: {
        "& fieldset": {
            borderColor: "#1976d2",
            fontSize: "0.75rem",
        },
        "&:hover fieldset": {
            borderColor: "#115293",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#0d47a1",
        },
    },
    documentMapContainer: {
        display: "flex",
        alignItems: "center",
        width: "100px",
        height: "100%",
    },
    documentMap: {
        width: "100px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        fontSize: "11px",
        lineHeight: "1",
        color: "#888",
        cursor: "pointer",
    },
    mapLine: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        padding: "0 2px",
        "&:hover": {
            backgroundColor: "yellow",
            color: "black",
        },
    },
    mapLineInRange: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        padding: "0 2px",
        backgroundColor: "black",
        color: "white",
        "&:hover": {
            backgroundColor: "yellow",
            color: "black",
        },
    },
});
export const CompactTableRow = styled(TableRow)({
    verticalAlign: 'top',
    overflow: 'auto',
});
export const CompactTableCellHeader = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '12px',
    verticalAlign: 'top',
    fontWeight: 'bold',
    backgroundColor: 'lavenderblush',
    zIndex: 1,
});
export const CompactTableCell0 = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '12px',
    verticalAlign: 'top',
    fontWeight: '100',
    fontStyle: 'italic',
    position: 'sticky',
    left: 0,
    background: '#fff', // Ensure the background is set to avoid overlap issues
    zIndex: 1, // Ensure it stays above other cells
});
export const CompactTableCell = styled(TableCell)({
    padding: '6px 8px 0',
    fontSize: '12px',
    fontWeight: '100',
    verticalAlign: 'top',
    whiteSpace: "nowrap",
    overflow: "auto",
});
export const CompactTableCellLong = styled(CompactTableCell)({
    whiteSpace: "wrap",
    maxHeight: "60px",
    minHeight: "20px",
    display: "block",
});
