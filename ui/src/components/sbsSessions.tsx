import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { ISbsSessionType, QueryResponseType } from "@foodvibes/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import FvBoundaryMarker from "./FvBoundaryMarker";
import react, { forwardRef, useEffect, useMemo, useState } from "react";
import SbsButton from "./sbsButton";
import { default as iconFile } from "@foodvibes/assets/icon_file.png";
import { default as iconFileJson } from "@foodvibes/assets/icon_file_json.png";
import { default as iconFolder } from "@foodvibes/assets/icon_folder.png";

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
const SbsIcon = (fileName: string) => {
    let icon: string = iconFile;

    if (fileName.endsWith('.jsonl')) {
        icon = iconFileJson;
    } else if (fileName.endsWith('/') || fileName === '..') {
        icon = iconFolder;
    }

    return <img
        src={icon}
        className={"App-icon"}
        height={26}
        // width={24}
        alt="logo"
        style={{
            borderWidth: 0,
            position: "relative",
            top: "6px",
            margin: "0px 6px 0 0",
            backgroundColor: "inherit",
        }}
    />

};
const SbsSession = forwardRef((
    {
        pathCurrent,
        currSession,
        pagingState,
        setPagingState,
        selectCb,
        refreshCb,
        session,
        idx,
        classes,
    }: {
        pathCurrent: string;
        currSession: QueryResponseType<ISbsSessionType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        selectCb: (path: string) => void;
        refreshCb: () => void;
        session: ISbsSessionType;
        idx: number;
        classes: any;
    }, ref: react.ForwardedRef<HTMLDivElement>) => {

    if (idx < 0) {
        console.info('SbsSession', session);
    }

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
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            selectCb(session.path);
                        }}
                        title={idx < 0 ? `Up one level to ${session.path}` : ''}>
                        {SbsIcon(idx < 0 ? '..' : session.path)}
                        <span style={{ color: 'blue' }}>
                            {idx < 0 ? '..' : session.path.substring(pathCurrent.length + 1)}
                        </span>
                        {idx === 0 || idx === (currSession?.data?.length ?? 0) - 1 ?
                            <FvBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
                                console.info(`Sessions: ${idx === 0 ? 'top' : 'bottom'} is in view`, isInView);

                                if (isInView && pagingState === 0) {
                                    setPagingState(idx === 0 ? -1 : 1);
                                }
                            }} />
                            : null
                        }
                    </span>
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
    const [pathCurrent, setPathCurrent] = useState<string>('');
    const [pathCurrentFlds, setPathCurrentFlds] = useState<string[]>([]);
    const [pathParent, setPathParent] = useState<string>('');

    useEffect(() => {
        let currPathNew: string = currSession.data?.length ? currSession.data[0].path : currSession.meta?.query_params?.global_filter ?? '';

        const flds: string[] = currPathNew.split('/').filter((fld: string) => fld.length > 0);
        // const segmentCount: number = flds.length - 1;

        currPathNew = flds.slice(0, flds.length - 1).join('/');

        // console.info('currPath', segmentCount, flds, currPathNew);

        // setPathCurrent(segmentCount > 0 ? currPathNew : '');

        setPathCurrent(currPathNew);
        setPathCurrentFlds(currPathNew.split('/'));

        if (currPathNew.length) {
            const flds: string[] = currPathNew.split('/').filter((fld: string) => fld.length > 0);
            // const segmentCount: number = flds.length - 1;
            const parentPathNew: string = flds.slice(0, flds.length - 1).join('/');

            // console.info('parentPath', segmentCount, flds, parentPathNew);

            // setPathParent(segmentCount > 0 ? [parentPathNew, ''].join('/') : '');
            setPathParent([parentPathNew, ''].join('/'));
        }
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
                            <TableCell className={classes.compactCell}>Container <strong>{
                                pathCurrentFlds.map((fld: string, idx: number) => (
                                    <span
                                        key={`fld${idx}`}
                                        onClick={() => {
                                            if (idx < pathCurrentFlds.length - 1) {
                                                selectCb([pathCurrentFlds.slice(0, idx + 1).join('/'), ''].join('/'));
                                            }
                                        }}
                                        title={idx < pathCurrentFlds.length - 1 ? `Go to ${pathCurrentFlds.slice(0, idx + 1).join('/')}` : ''}>
                                        <span style={idx < pathCurrentFlds.length - 1 ? { color: 'blue', cursor: 'pointer', } : {}}>
                                            {fld}{"/ "}
                                        </span>
                                    </span>
                                ))

                            }</strong></TableCell>
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
                            {pathCurrentFlds.length > 1 ?
                                <SbsSession
                                    pathCurrent={pathCurrent}
                                    currSession={currSession}
                                    pagingState={pagingState}
                                    setPagingState={setPagingState}
                                    selectCb={selectCb}
                                    refreshCb={refreshCb}
                                    session={{
                                        id: 0,
                                        fact_count: 0,
                                        modified: '',
                                        path: pathParent,
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
                                    pathCurrent={pathCurrent}
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