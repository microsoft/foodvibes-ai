import { Box, Tooltip } from "@mui/material";
import { FvIconCommonNoImage } from "./FvIconCommonNoImage";

export const FvIconCommonInner = ({
    image_url = '',
    className = '',
    alt = 'Image',
    width = 45,
    height = 45,
    maxWidth = 276,
    maxHeight = 276,
}: {
    image_url?: string;
    className?: string;
    alt?: string;
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
}) => image_url ?
        <Tooltip title={(
            <Box component="div" sx={{
                padding: "0",
                width: `${2 + maxWidth}px`,
                height: `${2 + maxHeight}px`,
                display: "block",
                border: "1px solid black",
                borderRadius: "4px",
            }}>
                <img height={maxHeight} width={maxWidth} src={image_url} alt={alt} />
            </Box>
        )}>
            <img className={className} width={width} height={height} src={image_url} alt={alt} />
        </Tooltip>
        : <FvIconCommonNoImage />
    ;

export const FvIconCommon = ({
    image_url = '',
    title = 'Icon',
}: {
    image_url?: string;
    title?: string;
}) => (
    <Box component="div" title={title} sx={{
        padding: "0px",
        height: "47px",
        width: "47px",
        backgroundColor: "black",
        color: "white",
        borderRadius: "4px",
        border: "1px solid gray",
    }}>
        <FvIconCommonInner image_url={image_url} />
    </Box>
);
