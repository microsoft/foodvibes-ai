import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import react, { forwardRef } from "react";
import SbsButton from "./sbsButton";

const useStyles = makeStyles({
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
    },
    compactCell: {
        padding: '4px 8px',
    },
    compactNumericCell: {
        padding: '4px 8px',
        textAlign: 'right',
    },
});
const SbsSessions = forwardRef((
    {
        height,
        currSession,
        pagingState,
        setPagingState,
        selectCb,
    }: {
        height: string;
        currSession: QueryResponseType<ISbsSessionType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        selectCb: (id: number) => void;
    }, ref: react.ForwardedRef<HTMLDivElement>) => {
    const classes = useStyles();

    return (
        <Stack ref={ref} spacing={2}
            style={{
                height: "200px",
                width: "100%",
                overflow: 'auto',
                padding: '8px 0 0 0'
            }}
        >
            <TableContainer component={Paper} className={classes.tableContainer} style={{ width: '100%', margin: 'auto', height, }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow className={classes.stickyHeader}>
                            <TableCell className={classes.compactNumericCell}>ID</TableCell>
                            <TableCell className={classes.compactNumericCell}>Fact Count</TableCell>
                            <TableCell className={classes.compactCell}>Review Date</TableCell>
                            <TableCell className={classes.compactCell}>Reviewer</TableCell>
                            <TableCell className={classes.compactCell}>Path</TableCell>
                            <TableCell className={classes.compactCell}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currSession?.data?.map((session: ISbsSessionType, idx: number) => (
                            <TableRow key={`session${idx}`} className={classes.compactRow}>
                                <TableCell className={classes.compactNumericCell}>
                                    <>
                                        {session.id}
                                        {idx === 0 || idx === (currSession?.data?.length ?? 0) - 1 ?
                                            <FvBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
                                                console.info(`Sessions: ${idx === 0 ? 'top' : 'bottom'} is in view`, isInView);

                                                if (isInView && pagingState === 0) {
                                                    setPagingState(idx === 0 ? -1 : 1);
                                                }
                                            }} />
                                            : null
                                        }
                                    </>
                                </TableCell>
                                <TableCell className={classes.compactNumericCell}>{session.fact_count}</TableCell>
                                <TableCell className={classes.compactCell}>{session.review_date}</TableCell>
                                <TableCell className={classes.compactCell}>{session.reviewer}</TableCell>
                                <TableCell className={classes.compactCell}>{session.path}</TableCell>
                                <TableCell className={classes.compactCell}>
                                    <SbsButton caption="Review" clicktCb={() => {
                                        selectCb(session.id);
                                    }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
});

export default SbsSessions;