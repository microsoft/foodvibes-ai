import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { TextField } from "@material-ui/core";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { Button } from '@mui/material';

const SbsFactCellEdit = (
    {
        name,
        label,
        value,
        changeCb,
    }: {
        name: string;
        label: string;
        value: string;
        changeCb: (value: string | null) => void;
    }
) => {
    const [textValue, setTextValue] = useState<string>(value);

    useEffect(() => {
        setTextValue(value);
    }, [name]);

    return (
        <Box sx={{
            display: "block",
            position: "absolute",
            width: "360px",
            height: "200px",
            top: "50px",
            right: "58px",
            margin: "0 auto",
            textAlign: "left",
            border: "1px solid black",
            padding: "0",
            overflow: "auto",
            backgroundColor: "white",
            color: "black",
            whiteSpace: "nowrap",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 3,
        }}>
            <Box component="div" sx={{
                display: "flex",
                padding: "2px 6px",
                background: 'rgb(25, 118, 210)',
            }}>
                <Box component="span" sx={{
                    display: "flex",
                    float: "left",
                    width: "100%",
                    fontSize: '14px',
                    verticalAlign: 'top',
                    color: 'white',
                    lineHeight: '28px',

                }}>{label}</Box>
                <Box component="span" sx={{ display: "flex", float: "right", margin: "0" }}>
                    <Button
                        title='Save & close'
                        variant="contained"
                        color="primary"
                        disabled={textValue === value}
                        sx={{
                            border: '1px solid white',
                            margin: '0 4px 0 0',
                            padding: '2px',
                            fontSize: '10px',
                            minWidth: 'auto',
                        }}
                        onClick={() => {
                            changeCb(textValue);
                        }}
                    ><SaveIcon /></Button>
                    <Button
                        title='Cancel & close'
                        variant="contained"
                        color="error"
                        sx={{
                            border: '1px solid white',
                            padding: '2px',
                            fontSize: '10px',
                            minWidth: 'auto',
                        }}
                        onClick={() => {
                            changeCb(null);
                        }}
                    >{<CancelIcon />}</Button>
                </Box>
            </Box>
            <TextField
                id="outlined-editable-input"
                multiline
                minRows={4}
                maxRows={20}
                value={textValue}
                onChange={(e) => {
                    setTextValue(e.target.value);
                }}
                style={{
                    padding: "0",
                    border: "0",
                    width: '340px',
                    height: '162px',
                    maxHeight: '166px',
                    overflowY: 'hidden',
                    verticalAlign: "top",
                }}
                InputProps={{
                    style: {
                        display: "block",
                        verticalAlign: "top",
                        width: '340px',
                        height: '162px',
                        // overflowY: 'hidden',
                        fontSize: "12px",
                        padding: "6px",
                        // color: "black",
                        // lineHeight: `${KLineHeight}px`,
                    },
                    disableUnderline: true,
                }}
                variant="standard"
                fullWidth
            />
        </Box>
    );
};

export default SbsFactCellEdit;