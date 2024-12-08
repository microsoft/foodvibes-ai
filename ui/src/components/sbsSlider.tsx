import { Box, Slider, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const SbsSlider = (
    {
        defaultValue,
        max,
        step,
        style,
        label,
        changeCb,
    }: {
        defaultValue: number;
        max: number;
        step: number;
        style: React.CSSProperties | undefined;
        label: string;
        changeCb: (value: number) => void;
    }) => {
    const [value, setValue] = useState(defaultValue);
    const marks = useMemo(() => Array.from({ length: max + 1 }, (_, idx) => {
        const newValue = idx;
        return {
            value: newValue,
            label: idx === 0 || idx === max + 1 || (idx + 1) % 2 ? idx : "",
        }
    }), [max]);
    const handleChange = (_event: any, newValue: unknown) => {
        setValue(newValue as number);
    };

    useEffect(() => {
        if (value === defaultValue) {
            return;
        }

        const handler = setTimeout(() => {
            changeCb(value);
        }, 1250); // ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [value, defaultValue]);

    return (
        <Box>
            <Typography
                id="slider-label"
                gutterBottom
                style={{
                    backgroundColor: "gainsboro",
                    borderRadius: "4px",
                    fontSize: "12px",
                    margin: "8px 0 0",
                    width: "96%",
                    textAlign: "center",
                }}>
                {label}
            </Typography>

            <Slider
                aria-labelledby="slider-label"
                style={{
                    width: "84%",
                    fontSize: "12px",
                    margin: "0",
                    ...style,
                }}
                defaultValue={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                step={step}
                marks={marks}
                min={0}
                max={max}
            />
        </Box>
    );
};

export default SbsSlider;
