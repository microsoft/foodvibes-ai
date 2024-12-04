import { Slider } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const SbsSlider = (
    { defaultValue, max, step, style, changeCb, }:
        { defaultValue: number; max: number; step: number; style: React.CSSProperties | undefined; changeCb: (value: number) => void; }) => {
    const [value, setValue] = useState(defaultValue);
    const marks = useMemo(() => Array.from({ length: max }, (_, idx) => {
        const newValue = idx + 1;
        return {
            value: newValue,
            label: newValue === 1 || newValue === max || newValue % 5 === 0 ? newValue.toString() : "",
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
        <Slider
            aria-labelledby="slider-label"
            style={style}
            defaultValue={value}
            onChange={handleChange}
            valueLabelDisplay="auto"
            step={step}
            marks={marks}
            min={0}
            max={max}
        />
    );
};

export default SbsSlider;
