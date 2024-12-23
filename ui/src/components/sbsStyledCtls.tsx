import { makeStyles, TableCell, TableRow } from "@material-ui/core";
import { styled } from "@mui/system";

export const UseSbsStyles = makeStyles({
    tableContainer: {
        // maxHeight: 440,
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 2,
    },
    compactRow: {
        height: 24,
        verticalAlign: 'top',
    },
    compactCell: {
        padding: '4px 8px',
        width: '40%',
    },
    compactCell2: {
        padding: '4px 8px',
        width: "360px",
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
