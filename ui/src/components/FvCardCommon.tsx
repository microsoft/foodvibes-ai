import styles from "@foodvibes/components/FvCommon.module.css";
import { KLedgerTypeGeotrack, KLedgerTypeProduct, KLedgerTypeScCircle, KLedgerTypeScGroup, KLedgerTypeScUser, KLedgerTypeTrackingProducts } from "@foodvibes/utils/commonConstants";
import {
    StyledCard,
    StyledCardContent,
    StyledCardHeader,
    StyledCardMedia,
    StyledCardSubtitle,
    StyledCardSubtitleContent,
    StyledCardSubtitleContentImg,
    StyledCardTitle,
} from "@foodvibes/utils/commonStyles";
import {
    CommonCallBack,
    CommonDetailLevel,
    CommonFlag,
} from "@foodvibes/utils/commonTypes";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Box } from "@mui/material";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { FvCardCommonToolbar } from "./FvCardCommonToolbar";
import { FvIconCommonInner } from "./FvIconCommon";

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
const RenderRibbon = ({
    operationName,
}: {
    operationName?: string;
}): JSX.Element => (
    <Box
        className={clsx(
            styles.ribbon,
            styles.ribbonTopRight,
            operationName === "update" && styles.ribbonTopRightAlt,
        )}
    >
        <span>{operationName}</span>
    </Box>
);
const RenderTypeTile = (
    {
        type,
        username,
    }: {
        type?: string;
        username?: string;
    }): JSX.Element => {
    let content: string = "";

    switch (type) {
        case KLedgerTypeScUser:
            content = "User";
            break
        case KLedgerTypeScGroup:
            content = "Group";
            break
        case KLedgerTypeScCircle:
            content = "Circle";
            break
        case KLedgerTypeProduct:
            content = "What";
            break;
        case KLedgerTypeGeotrack:
            content = "Where";
            break;
        case KLedgerTypeTrackingProducts:
            content = "When";
            break;
        default:
            return <></>;
    }

    return (
        <Box
            component="span"
            sx={{
                backgroundColor: "paleturquoise",
                border: "1px solid lightgray",
                lineHeight: "0",
                color: "black",
                fontSize: "0.8rem",
                padding: "0 4px 2px 4px",
                margin: "0 4px 0 0",
                borderRadius: "0",
                fontWeight: "bold",
                fontVariant: "small-caps",
                position: "relative",
                top: "2px",
            }}
            title={username?.length ? `By ${username}` : ""}
        >
            {content}
        </Box>
    );
};
const RenderAdjunctIcons = ({
    iconFlags,
    detailLevel = CommonDetailLevel.low,
}: {
    iconFlags?: CommonFlag[];
    detailLevel?: CommonDetailLevel;
}): JSX.Element => {
    return (
        <Box className={clsx(styles.icon_adjunct,
            detailLevel < CommonDetailLevel.high && (
                detailLevel < CommonDetailLevel.low ? styles.icon_adjunct_min : styles.icon_adjunct_low)
        )}>
            {(detailLevel < CommonDetailLevel.high && iconFlags?.length) &&
                iconFlags
                    .filter(i => i.imageSrc)
                    .map((i, idx) => (
                        <img
                            key={`adjunctImg${idx}`}
                            src={i.imageSrc}
                            alt={i.title}
                            title={i.title}
                        />
                    ))}
        </Box>
    );
};
const RenderHeader = ({
    headerContentCb,
    canEdit,
    type,
    tag,
    title,
    operationName,
    username,
    iconFlags,
    detailLevel = CommonDetailLevel.low,
    isWide,
    isTile,
    noRibbon,
}: {
    headerContentCb?: (payload: CommonCallBack) => JSX.Element;
    canEdit?: boolean;
    type?: string;
    tag?: string;
    title?: string;
    operationName?: string;
    username?: string;
    iconFlags?: CommonFlag[];
    detailLevel?: CommonDetailLevel;
    isWide?: boolean;
    isTile?: boolean;
    noRibbon?: boolean;
}) => {
    if (canEdit) {
        return (
            <StyledCardTitle>
                Edit {tag} {title}
            </StyledCardTitle>
        );
    }

    return (
        <>
            {!isWide && detailLevel === CommonDetailLevel.min && !isTile && (
                <StyledCardTitle>
                    <RenderTypeTile type={type} username={username} />
                </StyledCardTitle>
            )}
            {(isWide || detailLevel > CommonDetailLevel.min) && (
                <>
                    <StyledCardTitle>
                        {headerContentCb ?
                            headerContentCb({
                                detailLevel: CommonDetailLevel.low,
                                type,
                                tag,
                                title,
                            }) : (
                                <>
                                    <RenderTypeTile type={type} username={username} />
                                    {tag} {title}
                                </>
                            )}
                    </StyledCardTitle>
                    {noRibbon || <RenderRibbon
                        operationName={
                            operationName?.length ? operationName : "create"
                        }
                    />}
                </>
            )}
            <RenderAdjunctIcons iconFlags={iconFlags} detailLevel={detailLevel} />
        </>
    );
};
const getCardHeaderBorderStyles = (
    activeDetailLevel: CommonDetailLevel,
    isWide?: boolean,
) => {
    let borderTopRadius: number = 8;
    let borderRightRadius: number = 8;

    if ((activeDetailLevel === CommonDetailLevel.min || activeDetailLevel === CommonDetailLevel.low) && !isWide) {
        borderTopRadius = 0;
        borderRightRadius = 0;
    }

    return {
        borderRadius: `${borderTopRadius}px ${borderRightRadius}px 0 0`,
    };
};
const getCardBorderStyles = (
    activeDetailLevel: CommonDetailLevel,
    isWide?: boolean,
    noHeader?: boolean,
) => {
    let borderTopRadius: number = 8;
    let borderRightRadius: number = 8;
    let borderBottomRadius: number = 8;
    let borderLeftRadius: number = 8;

    if (activeDetailLevel === CommonDetailLevel.min || activeDetailLevel === CommonDetailLevel.low) {
        if (!isWide) {
            borderTopRadius = 0;
            borderRightRadius = 0;
        }

        borderBottomRadius = 0;
        borderLeftRadius = 0;
    }

    if (noHeader) {
        borderTopRadius = 0;
        borderRightRadius = 0;
    }

    return {
        borderRadius: `${borderTopRadius}px ${borderRightRadius}px ${borderBottomRadius}px ${borderLeftRadius}px`,
    };
};

export const FvCardCommon = ({
    iconToUse,
    iconFlags,
    idToUse,
    type,
    tag,
    title,
    operationName,
    username,
    imageUrl,
    isWide,
    canEdit,
    detailLevel = CommonDetailLevel.low,
    centerCount,
    centerCycle,
    centerIdx,
    graphCompactMode = false,
    graphDirection = false,
    legendState = false,
    isModal,
    isTile,
    noHeader,
    noBody,
    noRibbon,
    setDetailLevel,
    setCenterCycle,
    setCenterIdx,
    setGraphCompactMode,
    setGraphDirection,
    setLegendState,
    subtitleCb,
    contentCb,
    headerContentCb,
    zoomPercent,
    setZoomPercent,
}: {
    iconToUse: string;
    iconFlags?: CommonFlag[];
    idToUse?: string;
    type?: string;
    tag?: string;
    title?: string;
    operationName?: string;
    username?: string;
    imageUrl?: string;
    isWide?: boolean;
    canEdit?: boolean;
    detailLevel?: CommonDetailLevel;
    centerCount?: number;
    centerCycle?: boolean;
    centerIdx?: number;
    graphCompactMode?: boolean;
    graphDirection?: boolean;
    legendState?: boolean;
    opacityPercent?: number;
    deforestationAbovePct?: number;
    isModal?: boolean;
    isTile?: boolean;
    noHeader?: boolean;
    noBody?: boolean;
    noRibbon?: boolean;
    setDetailLevel?: (newLevel: number) => void;
    setCenterCycle?: (on: boolean) => void;
    setCenterIdx?: (idx: number) => void;
    setGraphCompactMode?: (graphCompactMode: boolean) => void;
    setGraphDirection?: (graphDirection: boolean) => void;
    setLegendState?: (legendState: boolean) => void;
    setOpacityPercent?: (opacityPercent: number) => void;
    setDeforestationAbovePct?: (deforestationAbovePct: number) => void;
    subtitleCb?: (detailLevel: CommonDetailLevel) => JSX.Element;
    contentCb?: ((payload: CommonCallBack) => JSX.Element) | null;
    headerContentCb?: (payload: CommonCallBack) => JSX.Element;
    zoomPercent?: number;
    setZoomPercent?: (zoomPercent: number) => void;
}) => {
    const [activeDetailLevel, setActiveDetailLevel] = useState<CommonDetailLevel>(detailLevel);

    useEffect(() => {
        setActiveDetailLevel(detailLevel);
    }, [detailLevel]);

    const minWidth: string = useMemo<string>(() => `${isWide ? 300 : 250}px`, [isWide, isTile]);
    const maxWidth: string = useMemo<string>(() => isWide || !isTile ? "auto" : "280px", [isWide, isTile]);
    const maxHeight: string = useMemo<string>(() =>
        isWide ||
            activeDetailLevel > CommonDetailLevel.low ||
            activeDetailLevel < CommonDetailLevel.low && isTile ? "auto" : "36px", [isWide, activeDetailLevel]);

    return (
        <StyledCard
            sx={{
                minWidth,
                maxWidth,
                minHeight: "36px",
                maxHeight,
                backgroundColor: !isTile || detailLevel > CommonDetailLevel.min ? (isWide ? "#ffffff" : "#ffffff") : "black",
                ...getCardBorderStyles(activeDetailLevel, isWide, noHeader),
                border: isModal && (activeDetailLevel === CommonDetailLevel.min || activeDetailLevel === CommonDetailLevel.low) ? "0" : {},
                borderRadius: isModal ? "0" : (isWide && noBody ? "8px 8px 0 0" : (isWide && noHeader ? "0 0 8px 8px" : null)),
                transition: "height 0.3s ease-in-out",
            }}
        >
            {noHeader || (
                <StyledCardHeader
                    sx={{
                        backgroundColor:
                            isWide || headerContentCb
                                ? "#bbbbbb"
                                : activeDetailLevel > CommonDetailLevel.low
                                    ? "#e0e0e0"
                                    : "#ffffff",
                        position: isWide ? "sticky" : "relative",
                        top: 0,
                        ...getCardHeaderBorderStyles(activeDetailLevel, isWide),
                        borderRadius: isModal ? "0" : {},
                    }}
                    avatar={
                        (isWide || !isTile || detailLevel > CommonDetailLevel.min) && (
                            <StyledCardMedia
                                image={iconToUse}
                                title={`${tag} "${idToUse}"`}
                                sx={{
                                    width: isWide ? "0px" : "0px",
                                }}
                                onClick={() => {
                                    if (isWide || !isTile || detailLevel > CommonDetailLevel.min) {
                                        setActiveDetailLevel(
                                            activeDetailLevel !== CommonDetailLevel.max
                                                ? CommonDetailLevel.max
                                                : detailLevel < CommonDetailLevel.max ? detailLevel : CommonDetailLevel.min,
                                        );
                                    }
                                }}
                            >
                                {!isWide && (
                                    <Box
                                        sx={{
                                            cursor: 'pointer',
                                            position: "relative",
                                            top: "-2px",
                                            left: "-2px",
                                            width: "20px",
                                            height: "35px",
                                            padding: "6px 0 0 0",
                                            margin: "0 0 0 -5px",
                                            '&:hover': {
                                                backgroundColor: 'yellow',
                                            },
                                        }}
                                        title={
                                            activeDetailLevel === CommonDetailLevel.max
                                                ? `See ${valuetext(detailLevel === CommonDetailLevel.max ? CommonDetailLevel.min : detailLevel)} details`
                                                : `See ${valuetext(CommonDetailLevel.max)} details`
                                        }
                                    >
                                        {activeDetailLevel ===
                                            CommonDetailLevel.max ? (
                                            <UnfoldLessIcon color="action" />
                                        ) : (
                                            <UnfoldMoreIcon color="action" />
                                        )}
                                    </Box>
                                )}
                            </StyledCardMedia>
                        )
                    }
                    title={
                        <RenderHeader
                            headerContentCb={headerContentCb}
                            canEdit={canEdit}
                            type={type}
                            tag={tag}
                            title={title}
                            operationName={operationName}
                            username={username}
                            iconFlags={iconFlags}
                            detailLevel={detailLevel}
                            isWide={isWide}
                            isTile={isTile}
                            noRibbon={noRibbon}
                        />
                    }
                    subheader={
                        <StyledCardSubtitle>
                            <>
                                {(isWide || headerContentCb || detailLevel > CommonDetailLevel.min || !isTile) &&
                                    <StyledCardSubtitleContent component="div" title={idToUse} sx={{
                                        minWidth,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        top: `${isWide || headerContentCb ? 20 : 18}px`,
                                        left: "20px",
                                    }}>
                                        {
                                            idToUse
                                        }
                                    </StyledCardSubtitleContent>
                                }
                                {(!isWide && detailLevel === CommonDetailLevel.min && isTile) &&
                                    <StyledCardSubtitleContentImg component="div" title={`[${title}] ${idToUse}`} sx={{
                                        color: "white",
                                        backgroundColor: "black",
                                    }}>
                                        <FvIconCommonInner image_url={imageUrl} />
                                    </StyledCardSubtitleContentImg>
                                }
                            </>
                            {subtitleCb && subtitleCb(activeDetailLevel)}
                            {<FvCardCommonToolbar
                                activeDetailLevel={activeDetailLevel}
                                centerCount={centerCount}
                                centerCycle={centerCycle}
                                centerIdx={centerIdx}
                                graphCompactMode={graphCompactMode}
                                graphDirection={graphDirection}
                                legendState={legendState}
                                setDetailLevel={setDetailLevel}
                                setCenterCycle={setCenterCycle}
                                setCenterIdx={setCenterIdx}
                                setGraphCompactMode={setGraphCompactMode}
                                setGraphDirection={setGraphDirection}
                                setLegendState={setLegendState}
                                zoomPercent={zoomPercent}
                                setZoomPercent={setZoomPercent}
                            />}
                        </StyledCardSubtitle>
                    }
                />
            )}
            {noBody || (
                <StyledCardContent
                    sx={{
                        margin: isWide || activeDetailLevel === CommonDetailLevel.min ? "0" : "12px",
                        borderTop: `${isWide ? 1 : 0}px solid gray`,
                        transition: "height 0.3s ease-in-out",
                    }}
                >
                    {contentCb &&
                        contentCb({
                            detailLevel: activeDetailLevel,
                            isModal,
                            iconFlags,
                        })}
                </StyledCardContent>
            )}
        </StyledCard>
    );
};
