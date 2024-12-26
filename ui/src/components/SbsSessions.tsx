import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { ISbsSessionType, QueryResponseType } from "@sbssrc/utils/commonTypes";
import { Box, Stack } from "@mui/system";
import SbsBoundaryMarker from "./sbsBoundaryMarker";
import react, { useEffect, useState } from "react";
import { default as iconFile } from "@sbssrc/assets/icon_file.png";
import { default as iconFileJson } from "@sbssrc/assets/icon_file_json.png";
import { default as iconFolder } from "@sbssrc/assets/icon_folder.png";
import { UseSbsStyles } from "./SbsStyledCtls";

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
const SbsSession = (
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
    }
) => {

    if (idx < 0) {
        console.info('SbsSession', session);
    }

    return (
        <TableRow key={`session${idx}`} className={classes.compactRow}>
            <TableCell className={classes.compactCell1}>
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
                            <SbsBoundaryMarker hasComeIntoViewCb={(isInView: boolean) => {
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
            <TableCell className={classes.compactCell3}>
                <span style={{ color: '#444444', lineHeight: "30px" }}>
                    {session.modified.replace('T', ' ').replace('Z', '')}
                </span>
            </TableCell>
        </TableRow>
    );
};
const SbsSessions = (
    {
        refTitleTracker,
        refBodyTracker,
        height,
        subHeight,
        currSession,
        pagingState,
        setPagingState,
        selectCb,
        refreshCb,
    }: {
        refTitleTracker: React.RefObject<HTMLDivElement>;
        refBodyTracker: React.RefObject<HTMLDivElement>;
        height: number;
        subHeight: number;
        currSession: QueryResponseType<ISbsSessionType>;
        pagingState: number;
        setPagingState: (value: number) => void;
        selectCb: (path: string) => void;
        refreshCb: () => void;
    }
) => {
    const classes = UseSbsStyles();
    const [pathCurrent, setPathCurrent] = useState<string>('');
    const [pathCurrentFlds, setPathCurrentFlds] = useState<string[]>([]);
    const [pathParent, setPathParent] = useState<string>('');

    useEffect(() => {
        let currPathNew: string = currSession.data?.length ? currSession.data[0].path : currSession.meta?.query_params?.global_filter ?? '';
        const flds: string[] = currPathNew.split('/').filter((fld: string) => fld.length > 0);

        currPathNew = flds.slice(0, flds.length - 1).join('/');

        setPathCurrent(currPathNew);
        setPathCurrentFlds(currPathNew.split('/'));

        if (currPathNew.length) {
            const flds: string[] = currPathNew.split('/').filter((fld: string) => fld.length > 0);
            const parentPathNew: string = flds.slice(0, flds.length - 1).join('/');

            setPathParent([parentPathNew, ''].join('/'));
        }
    }, [currSession]);

    return (
        <Stack spacing={1}
            style={{
                height,
                width: "100%",
                overflow: 'auto',
                padding: '0'
            }}
        >
            <Box ref={refTitleTracker} sx={{ padding: "0", margin: "0", display: "block", }}>
                <Box sx={{ padding: "8px", backgroundColor: "#dcdcdc", display: "block", }}>
                    Container <strong>{
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
                    }</strong>
                </Box>
                <TableContainer style={{
                    width: '100%',
                    margin: "0",
                    padding: "0",
                    maxHeight: `${40}px`,
                    minHeight: `${40}px`,
                }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow className={classes.stickyHeader}>
                                <TableCell className={classes.compactCell1h}>Name</TableCell>
                                <TableCell className={classes.compactCell3h}>Modified</TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>
            </Box>
            <TableContainer ref={refBodyTracker} component={Paper} className={classes.tableContainer} style={{
                width: '100%',
                margin: "0",
                padding: "0",
                maxHeight: `${subHeight}px`,
                minHeight: `${subHeight}px`,
            }}>
                <Table stickyHeader>
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
};

export default SbsSessions;