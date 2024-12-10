import React, { useState } from 'react';
import { ToggleButton } from '@mui/lab';

const SbsToggle = (
    {
        selected,
        clicktCb,
        clicktCbArg,
        style,
        children,
    }:
        {
            selected: boolean;
            clicktCb: (newValue: boolean, arg?: string | number) => void;
            clicktCbArg?: string | number;
            style?: React.CSSProperties;
            children?: React.ReactNode;
        }
) => {
    const handleToggle = () => {
        clicktCb(!selected, clicktCbArg);
    };

    return (
        <ToggleButton
            value="check"
            selected={selected}
            onChange={handleToggle}
            style={{
                ...style,
                color: selected ? 'white' : 'inherit',
                backgroundColor: selected ? 'navy' : 'inherit',
                padding: '0',
                border: '1px solid navy',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            {children}
        </ToggleButton>
    );
};

export default SbsToggle;