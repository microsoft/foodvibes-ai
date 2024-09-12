import {
    CommonDetailLevel,
} from "@foodvibes/utils/commonTypes";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

import { Box, Grid, Slider } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const zoomMin = 25;
const zoomMax = 200;
const zoomInc = 5;
const marks = [
    {
        value: 0,
        label: "Min",
    },
    {
        value: 1,
        label: "Low",
    },
    {
        value: 2,
        label: "High",
    },
    {
        value: 3,
        label: "Max",
    },
];

const valuetext = (value: number): string =>
    `${marks?.find(m => m.value === value)?.label}` ?? "";

export const FvCardCommonToolbar = ({
    activeDetailLevel = CommonDetailLevel.low,
    centerCount = 0,
    centerCycle,
    centerIdx,
    graphCompactMode = false,
    graphDirection = false,
    legendState = false,
    setCenterCycle,
    setCenterIdx,
    setDetailLevel,
    setGraphCompactMode,
    setGraphDirection,
    setLegendState,
    zoomPercent,
    setZoomPercent,
}: {
    activeDetailLevel?: CommonDetailLevel;
    centerCount?: number;
    centerCycle?: boolean;
    centerIdx?: number;
    graphCompactMode?: boolean;
    graphDirection?: boolean;
    legendState?: boolean;
    setDetailLevel?: (newLevel: number) => void;
    setCenterCycle?: (on: boolean) => void;
    setCenterIdx?: (idx: number) => void;
    setGraphCompactMode?: (graphCompactMode: boolean) => void;
    setGraphDirection?: (graphDirection: boolean) => void;
    setLegendState?: (legendState: boolean) => void;
    zoomPercent?: number;
    setZoomPercent?: (zoomPercent: number) => void;
}) => {
    const showJourneyControls: boolean = useMemo<boolean>(() => setLegendState && setCenterCycle && setCenterIdx ? true : false, [setLegendState, setCenterCycle, setCenterIdx]);
    const showGraphControls: boolean = useMemo<boolean>(() => setGraphDirection && setGraphCompactMode && setZoomPercent ? true : false, [setGraphDirection, setGraphCompactMode, setZoomPercent]);
    const controlLeftRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const controlRightRef: React.MutableRefObject<null> | null = useRef<null>(null);
    const [ribbonHeight, setRibbonHeight] = useState<number>(1);

    const onResize = useCallback(() => {
        if (controlLeftRef?.current && controlRightRef?.current) {
            const dimensionsLeft = (controlLeftRef.current as HTMLElement).getBoundingClientRect();
            const dimensionsRight = (controlRightRef.current as HTMLElement).getBoundingClientRect();

            console.warn(`Ribbon: topL=${dimensionsLeft.top} & topR=${dimensionsRight.top}`);
            setRibbonHeight(dimensionsRight.top - dimensionsLeft.top);
        }
    }, []);
    useEffect(() => {
        if (controlLeftRef?.current && controlRightRef?.current) {
            window.addEventListener("resize", onResize);
            onResize();
            return () => {
                if (controlLeftRef?.current && controlRightRef?.current) {
                    window.removeEventListener("resize", onResize);
                }
            };
        }
    }, [controlLeftRef?.current, controlRightRef?.current]);

    return (setDetailLevel || showJourneyControls || showGraphControls) && (
        <Grid container spacing={0} sx={{
            padding: "0",
            margin: "0",
            height: `${ribbonHeight}px`,
            position: "relative",
            top: "-18px",
        }}>
            {setDetailLevel &&
                <Grid item xs>
                    <Box
                        ref={controlLeftRef}
                        sx={{
                            // position: "relative",
                            // top: "-16px",
                            display: "inline-block",
                            maxHeight: "20px",
                            minHeight: "20px",
                            maxWidth: "152px",
                            minWidth: "152px",
                        }}
                    >
                        <Box
                            sx={{
                                display: "inline-block",
                                maxHeight: "20px",
                                minHeight: "20px",
                                maxWidth: "72px",
                                minWidth: "72px",
                            }}
                        >
                            Details:{" "}
                            {valuetext(
                                activeDetailLevel as number,
                            )}
                        </Box>
                        <Slider
                            sx={{
                                margin: "0 0 0 16px",
                                padding: "0",
                                height: "10px",
                                maxWidth: "60px",
                                minWidth: "60px",
                                display: "inline-block",
                            }}
                            aria-label="Custom marks"
                            value={activeDetailLevel}
                            getAriaValueText={valuetext}
                            step={1}
                            min={CommonDetailLevel.min}
                            max={CommonDetailLevel.max}
                            valueLabelDisplay="off"
                            marks={Array.from({ length: CommonDetailLevel.max + 1 }, (v, k) => k).map(e => ({
                                value: e,
                            }))}
                            onChange={(
                                event: Event,
                                value:
                                    | number
                                    | number[],
                            ) =>
                                setDetailLevel(
                                    value as number,
                                )
                            }
                        />
                    </Box>
                </Grid>
            }
            {showJourneyControls &&
                <Grid item xs={9}>
                    <Box
                        ref={controlRightRef}
                        sx={{
                            display: "inline-block",
                            margin: "0 8px 0 0",
                            padding: "0",
                            position: "relative",
                            height: "12px",
                        }}
                        title={`${legendState ? "Hide" : "Show"} map controls & legend`}
                        onClick={() =>
                            setLegendState &&
                            setLegendState(!legendState)
                        }
                    >
                        <LegendToggleIcon
                            sx={{
                                display: "block",
                                backgroundColor: "white",
                                height: "18px",
                                width: "18px",
                                border: `1px solid ${legendState ? 'red' : 'black'}`,
                                boxShadow: legendState ? "inset 0 0 5px #919191" : "inset 0",
                                outline: "none",
                                borderRadius: "4px",
                                position: "relative",
                                top: "-2px",
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: "inline-block",
                            margin: "0 8px 0 0",
                            padding: "0",
                            position: "relative",
                            height: "12px",
                        }}
                        title={`${centerCycle ? "Stop" : "Play"} location cycling`}
                        onClick={() => setCenterCycle && setCenterCycle(!centerCycle)}
                    >
                        {centerCycle ?
                            <StopIcon
                                sx={{
                                    display: "block",
                                    backgroundColor: "white",
                                    height: "18px",
                                    width: "18px",
                                    border: "1px solid red",
                                    boxShadow: "inset 0 0 5px #919191",
                                    outline: "none",
                                    borderRadius: "4px",
                                    position: "relative",
                                    top: "-2px",
                                }} /> :
                            <PlayArrowIcon
                                sx={{
                                    display: "block",
                                    backgroundColor: "white",
                                    height: "18px",
                                    width: "18px",
                                    border: "1px solid black",
                                    boxShadow: "inset 0",
                                    outline: "none",
                                    borderRadius: "4px",
                                    position: "relative",
                                    top: "-2px",
                                }} />}
                    </Box>
                    <Box
                        sx={{
                            display: "inline-block",
                            maxHeight: "20px",
                            minHeight: "20px",
                            maxWidth: "152px",
                            minWidth: "152px",
                            margin: "0 0 0 8px",
                        }}
                    >
                        <Box
                            sx={{
                                display: "inline-block",
                                maxHeight: "20px",
                                minHeight: "20px",
                                maxWidth: "82px",
                                minWidth: "82px",
                            }}
                        >
                            Location{" "}
                            {centerIdx === 0
                                ? `All ${centerCount}`
                                : `${centerIdx} of ${centerCount}`}
                        </Box>
                        <Slider
                            sx={{
                                margin: "0 0 0 16px",
                                padding: "0",
                                height: "10px",
                                maxWidth: "100px",
                                minWidth: "100px",
                                display: "inline-block",
                            }}
                            aria-label="Custom marks"
                            value={centerIdx}
                            getAriaValueText={valuetext}
                            step={1}
                            min={0}
                            max={centerCount}
                            marks={Array.from({ length: centerCount + 1 }, (v, k) => k).map(e => ({
                                value: e,
                            }))}
                            valueLabelDisplay="off"
                            onChange={(
                                event: Event,
                                value: number | number[],
                            ) => {
                                setCenterCycle && setCenterCycle(false);
                                setCenterIdx && setCenterIdx(value as number);
                            }}
                        />
                    </Box>
                </Grid>
            }
            {showGraphControls &&
                <Grid item xs={9}>
                    <Box
                        ref={controlRightRef}
                        sx={{
                            display: "inline-block",
                            margin: "0 8px 0 0",
                            padding: "0",
                            position: "relative",
                            height: "12px",
                        }}
                        title={`${graphDirection ? 'Late to Early' : 'Early to Late'} graph flow (click to reverse direction)`}
                        onClick={() =>
                            setGraphDirection &&
                            setGraphDirection(!graphDirection)
                        }
                    >
                        {graphDirection ?
                            <ArrowUpwardIcon
                                sx={{
                                    display: "block",
                                    backgroundColor: "white",
                                    height: "18px",
                                    width: "18px",
                                    border: "1px solid red",
                                    boxShadow: graphDirection ? "inset 0 0 5px #919191" : "inset 0",
                                    outline: "none",
                                    borderRadius: "4px",
                                    position: "relative",
                                    top: "-2px",
                                }} /> :
                            <ArrowDownwardIcon
                                sx={{
                                    display: "block",
                                    backgroundColor: "white",
                                    height: "18px",
                                    width: "18px",
                                    border: "1px solid black",
                                    boxShadow: graphDirection ? "inset 0 0 5px #919191" : "inset 0",
                                    outline: "none",
                                    borderRadius: "4px",
                                    position: "relative",
                                    top: "-2px",
                                }} />}
                    </Box>
                    <Box
                        sx={{
                            display: "inline-block",
                            margin: "0 8px 0 0",
                            padding: "0",
                            position: "relative",
                            height: "12px",
                        }}
                        title={`"${graphCompactMode ? 'Compact' : 'Expanded'}" graph layout (click for "${graphCompactMode ? 'Expanded' : 'Compact'}" layout)`}
                        onClick={() =>
                            setGraphCompactMode &&
                            setGraphCompactMode(!graphCompactMode)
                        }
                    >
                        {graphCompactMode ?
                            <Grid4x4Icon
                                sx={{
                                    display: "block",
                                    backgroundColor: "white",
                                    height: "18px",
                                    width: "18px",
                                    border: "1px solid red",
                                    boxShadow: "inset 0 0 5px #919191",
                                    outline: "none",
                                    borderRadius: "4px",
                                    position: "relative",
                                    top: "-2px",
                                }} /> :
                            <Grid3x3Icon
                                sx={{
                                    display: "block",
                                    backgroundColor: "white",
                                    height: "18px",
                                    width: "18px",
                                    border: "1px solid black",
                                    boxShadow: "inset 0",
                                    outline: "none",
                                    borderRadius: "4px",
                                    position: "relative",
                                    top: "-2px",
                                }} />}
                    </Box>
                    <Box
                        sx={{
                            display: "inline-block",
                            maxHeight: "20px",
                            minHeight: "20px",
                            maxWidth: "152px",
                            minWidth: "152px",
                            margin: "0 0 0 8px",
                        }}
                    >
                        <Box
                            sx={{
                                display: "inline-block",
                                maxHeight: "20px",
                                minHeight: "20px",
                                maxWidth: "72px",
                                minWidth: "72px",
                            }}
                        >
                            Zoom:{" "}
                            {zoomPercent}%
                        </Box>
                        <Slider
                            sx={{
                                margin: "0 0 0 16px",
                                padding: "0",
                                height: "10px",
                                maxWidth: "60px",
                                minWidth: "60px",
                                display: "inline-block",
                            }}
                            aria-label="Custom marks"
                            value={zoomPercent}
                            getAriaValueText={valuetext}
                            step={zoomInc}
                            min={zoomMin}
                            max={zoomMax}
                            valueLabelDisplay="off"
                            marks={Array.from({ length: (zoomMax - zoomMin) / zoomInc + 1 }, (v, k) => (zoomMin - zoomInc) + zoomInc * (k + 1)).map(e => ({
                                value: e,
                            }))}
                            onChange={(
                                event: Event,
                                value:
                                    | number
                                    | number[],
                            ) =>
                                setZoomPercent && setZoomPercent(
                                    value as number,
                                )
                            }
                        />
                    </Box>
                </Grid>
            }
        </Grid>
    );
};
