import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import react, { forwardRef, useMemo } from "react";
import SbsButton from "./sbsButton";
import { join } from "path";

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
const SbsSession = forwardRef((
    {
        currSession,
        pagingState,
        setPagingState,
        selectCb,
        refreshCb,
        session,
        idx,
        classes,
    }: {
        currSession: QueryResponseType<ISbsSessionType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        selectCb: (path: string) => void;
        refreshCb: () => void;
        session: ISbsSessionType;
        idx: number;
        classes: any;
    }, ref: react.ForwardedRef<HTMLDivElement>) => {

    return (
        <TableRow key={`session${idx}`} className={classes.compactRow}>
            {/* <TableCell className={classes.compactNumericCell}>
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
            <TableCell className={classes.compactCell}>{session.reviewer}</TableCell> */}
            <TableCell className={classes.compactCell}>
                <>
                    <span style={{ color: 'blue', cursor: 'pointer' }}
                        title={`Up one level to ${session.path}`}
                        onClick={() => {
                            selectCb(session.path);
                        }}>{idx < 0 ? '..' : session.path}</span>
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
            <TableCell className={classes.compactCell}>{session.modified}</TableCell>
            {/* <TableCell className={classes.compactCell}>
                <SbsButton caption="Review" clicktCb={() => {
                    selectCb(session.id);
                }} />
            </TableCell> */}
        </TableRow>
    );
});
const SbsSessions = forwardRef((
    {
        height,
        currSession,
        pagingState,
        setPagingState,
        selectCb,
        refreshCb,
    }: {
        height: string;
        currSession: QueryResponseType<ISbsSessionType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        selectCb: (path: string) => void;
        refreshCb: () => void;
    }, ref: react.ForwardedRef<HTMLDivElement>) => {
    const classes = useStyles();
    const parentPath: string = useMemo<string>(() => {
        console.info('parentPath0', currSession.data?.[0].path);
        if (currSession.data?.length) {
            const flds: string[] = currSession.data[0].path.split('/');
            const isJsonl: boolean = flds[flds.length - 1].endsWith('.jsonl');
            const segmentOffset: number = isJsonl ? 1 : 2;
            const segmentCount: number = flds.length - segmentOffset;

            if (segmentCount > 0) {
                let path: string = flds.slice(0, segmentCount).join('/');

                if (segmentCount === 0) {
                    path = '';
                }

                console.info('parentPath1', path);

                if (segmentCount > 0) {
                    return path;
                }
            }
        }

        return '';
    }, [currSession]);

    return (
        <Stack ref={ref} spacing={2}
            style={{
                height,
                width: "100%",
                overflow: 'auto',
                padding: '8px 0 0 0'
            }}
        >
            <TableContainer component={Paper} className={classes.tableContainer} style={{ width: '100%', margin: 'auto', height, }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow className={classes.stickyHeader}>
                            {/* <TableCell className={classes.compactNumericCell}>ID</TableCell>
                            <TableCell className={classes.compactNumericCell}>Fact Count</TableCell>
                            <TableCell className={classes.compactCell}>Review Date</TableCell>
                            <TableCell className={classes.compactCell}>Reviewer</TableCell> */}
                            <TableCell className={classes.compactCell}>Container <strong>{parentPath}</strong></TableCell>
                            <TableCell className={classes.compactCell}>Modified</TableCell>
                            {/* <TableCell className={classes.compactCell}>
                                <SbsButton caption="Refresh" clicktCb={() => {
                                    refreshCb();
                                }} />
                            </TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {parentPath.length > 0 ?
                                <SbsSession
                                    currSession={currSession}
                                    pagingState={pagingState}
                                    setPagingState={setPagingState}
                                    selectCb={selectCb}
                                    refreshCb={refreshCb}
                                    session={{
                                        id: 0,
                                        fact_count: 0,
                                        modified: '',
                                        path: parentPath,
                                        review_date: '',
                                        reviewer: '',
                                    } as ISbsSessionType}
                                    idx={-1}
                                    classes={classes}
                                />
                                : null
                            }
                            {currSession?.data?.map((session: ISbsSessionType, idx: number) => (
                                <SbsSession
                                    key={`sessionRow${idx}`}
                                    ref={ref}
                                    currSession={currSession}
                                    pagingState={pagingState}
                                    setPagingState={setPagingState}
                                    selectCb={selectCb}
                                    refreshCb={refreshCb}
                                    session={session}
                                    idx={idx}
                                    classes={classes}
                                />
                            ))}
                        </>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    );
});

export default SbsSessions;