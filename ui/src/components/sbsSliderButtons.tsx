import React, { useEffect, useRef, useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography, Backdrop } from '@mui/material';
import {
    KScoreColor0Bc, KScoreColor1Bc, KScoreColor2Bc, KScoreColor3Bc, KScoreColor4Bc, KScoreColor5Bc,
    KScoreCaption0, KScoreCaption1, KScoreCaption2, KScoreCaption3, KScoreCaption4, KScoreCaption5,

} from '@foodvibes/utils/commonConstants';
import { HexToRgba } from '@foodvibes/utils/commonFunctions';
import { Dropdown, IDropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';

const dropdownCommonStyles = {
    width: "30px",
    padding: "0",
    margin: "0",
    textAlign: "center",
    fontSize: "12px",
    maxHeight: '20px',
    minHeight: '20px',
    lineHeight: '16px'
};
const dropdownCommonStylesDdl = {
    ...dropdownCommonStyles,
    width: "26px",
    margin: "0 2px",
    borderRadius: '4px',
};
const SbsSliderButtonsHorizaontal = (
    {
        selectedValue,
        captionPrefix = "",
        caption = "",
        colorsBc,
        colorText,
        handleSelection,
    }: {
        selectedValue: number;
        captionPrefix: string;
        caption: string;
        colorsBc: string[];
        colorText: string[];
        handleSelection: (_event: React.MouseEvent<HTMLElement>, newSelection: number | null) => void;
    }) => {
    const dropdownRef = useRef<IDropdown>(null);

    return (
        <Box
            title={`${caption}: ${colorText[selectedValue]}`}
            sx={{
                padding: "0",
                margin: "0 1px 0 0",
                backgroundColor: "lavenderblush",
                whiteSpace: "nowrap",
                borderRadius: "4px",
                border: "1px solid gray",
            }}>
            {caption && captionPrefix &&
                <Box
                    onClick={() => {
                        if (dropdownRef.current) {
                            dropdownRef.current.focus();
                        }
                    }}
                    sx={{ padding: "1px 4px 0 4px", display: "inline-flex", cursor: "default", fontWeight: "bold", }}
                >
                    {captionPrefix}
                </Box>
            }
            <Box sx={{ padding: "0", display: "inline-flex", }}>
                <Dropdown
                    componentRef={dropdownRef}
                    placeholder={captionPrefix}
                    options={colorsBc.map((color, idx) => ({
                        key: idx,
                        text: `${idx}`,
                    }))}
                    selectedKey={selectedValue}
                    styles={{
                        dropdown: {
                            ...dropdownCommonStyles,
                        },
                        dropdownItem: {
                            ...dropdownCommonStylesDdl,
                            border: '1px solid gray',
                        },
                        dropdownItemSelected: {
                            ...dropdownCommonStylesDdl,
                            border: '1px solid black',
                        },
                        title: {
                            backgroundColor: HexToRgba(colorsBc[selectedValue], selectedValue ? 1 : 0.25),
                            color: `${selectedValue > 0 && selectedValue < 5 ? 'white' : 'black'} !important`,
                            ...dropdownCommonStyles,
                        },
                    }}
                    onRenderOption={(option?: IDropdownOption, defaultRender?: (props?: IDropdownOption) => JSX.Element | null) => {
                        const idx = option?.index ?? 0;

                        return (
                            <div
                                style={{
                                    backgroundColor: HexToRgba(colorsBc[idx ?? 0], 0.25),
                                    color: 'black',
                                    padding: "1px",
                                    margin: "0",
                                    width: "30px",
                                    textAlign: "center",
                                    fontSize: "12px",
                                }}
                                title={colorText[idx]}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = HexToRgba(colorsBc[idx ?? 0], 1.0);
                                    e.currentTarget.style.color = idx > 0 && idx < 5 ? 'white' : 'black';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = HexToRgba(colorsBc[idx ?? 0], 0.25);
                                    e.currentTarget.style.color = 'black';
                                }}
                            >
                                {defaultRender ? defaultRender(option) : option?.text}
                            </div>
                        );
                    }}
                    onChange={(_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
                        if (option) {
                            handleSelection({} as React.MouseEvent<HTMLElement>, option.key as number);
                        }
                    }}
                />
            </Box>
        </Box>
    );
};
const SbsSliderButtonsVertical = (
    {
        selectedValue,
        captionPrefix = "",
        caption = "",
        colorsBc,
        colorText,
        handleSelection,
    }: {
        selectedValue: number;
        captionPrefix: string;
        caption: string;
        colorsBc: string[];
        colorText: string[];
        handleSelection: (_event: React.MouseEvent<HTMLElement>, newSelection: number | null) => void;
    }) => (
    <Box sx={{
        display: "inline-flex",
        padding: "0",
        margin: "0px 8px",
    }}>
        {caption &&
            <Box sx={{ width: "120px", padding: "4px 0 0 " }}>{
                captionPrefix && <strong>{captionPrefix}{": "}</strong>
            }{caption}</Box>
        }
        <ToggleButtonGroup
            value={selectedValue}
            exclusive
            onChange={handleSelection}
            aria-label="number selection"
            sx={{
                display: 'inline-flex',
                margin: '0',
                backgroundColor: 'inherit',
                borderRadius: '6px',
                border: `0px solid gray`,
                color: 'black',
            }}
        >
            {colorsBc.map((backgroundColor, idx) => (
                <ToggleButton
                    key={`button${idx}`}
                    title={colorText[idx]}
                    selected={selectedValue === idx}
                    value={idx}
                    aria-label={`number ${idx}`}
                    sx={{
                        display: 'inline-flex',
                        margin: '0 2px',
                        fontSize: '11px',
                        backgroundColor: HexToRgba(backgroundColor, 0.25),
                        color: 'black',
                        borderRadius: '6px',
                        border: `1px solid gray`,
                        '&:hover': {
                            backgroundColor,
                            color: idx > 0 && idx < 5 ? 'white' : 'black',
                        },
                        '&.Mui-selected': {
                            backgroundColor,
                            color: idx > 0 && idx < 5 ? 'white' : 'black',
                            '&:hover': {
                                backgroundColor,
                                color: idx > 0 && idx < 5 ? 'white' : 'black',
                            },
                        },
                    }}
                >
                    {idx}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    </Box>
);
const SbsSliderButtons = (
    {
        isHorizontal = true,
        defaultValue = 0,
        captionPrefix = "",
        caption = "",
        colorsBc = [
            KScoreColor0Bc, KScoreColor1Bc, KScoreColor2Bc, KScoreColor3Bc, KScoreColor4Bc, KScoreColor5Bc,
        ],
        colorText = [
            KScoreCaption0, KScoreCaption1, KScoreCaption2, KScoreCaption3, KScoreCaption4, KScoreCaption5,
        ],
        style,
        changeCb,
    }: {
        isHorizontal?: boolean;
        defaultValue: number;
        captionPrefix?: string;
        caption?: string;
        colorsBc?: string[];
        colorText?: string[];
        style?: React.CSSProperties | undefined;
        changeCb: (value: number) => void;
    }) => {
    const [selectedValue, setSelectedValue] = useState<number>(0);
    const handleSelection = (_event: React.MouseEvent<HTMLElement>, newSelection: number | null) => {
        if (newSelection !== null) {
            setSelectedValue(newSelection);
            changeCb(newSelection);
        }
    };

    useEffect(() => {
        setSelectedValue(defaultValue);
    }, [defaultValue]);

    return (
        <Box display="flex" alignItems="center" sx={{
            width: "100%",
            display: "inline-flex",
            ...style,
        }}>
            <Typography
                id="slider-label"
                gutterBottom
                style={{
                    display: "inline-flex",
                    backgroundColor: "lavenderblush",
                    borderRadius: "4px",
                    fontSize: "12px",
                    margin: isHorizontal ? "0" : "6px 0 0",
                    padding: "0",
                    height: isHorizontal ? "22px" : "24px",
                    textAlign: "left",
                    width: "100%",
                }}
            >
                {isHorizontal ?
                    <SbsSliderButtonsHorizaontal
                        selectedValue={selectedValue}
                        captionPrefix={captionPrefix}
                        caption={caption}
                        colorsBc={colorsBc}
                        colorText={colorText}
                        handleSelection={handleSelection}
                    />
                    :
                    <SbsSliderButtonsVertical selectedValue={selectedValue}
                        captionPrefix={captionPrefix}
                        caption={caption}
                        colorsBc={colorsBc}
                        colorText={colorText}
                        handleSelection={handleSelection}
                    />
                }
            </Typography>
        </Box >
    );
};

export default SbsSliderButtons;
