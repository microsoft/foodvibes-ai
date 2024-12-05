import React from "react";
import { Box, TextField, Checkbox, Slider, Grid, Typography, makeStyles, FormControl, InputLabel } from "@material-ui/core";
import { ISbsFactType } from "@foodvibes/utils/commonTypes";
import SbsSlider from "./sbsSlider";
import { fontSize } from "@mui/system";

const useStyles = makeStyles({
    customOutlinedInputRoot: {
        "& fieldset": {
            borderColor: "#1976d2",
            fontSize: "0.75rem",
        },
        "&:hover fieldset": {
            borderColor: "#115293",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#0d47a1",
        },
    },
});
const SbsSubFact = ({ title, body }: { title: string; body: string; }) =>
    <Box sx={{ margin: "6px 0 0", padding: "0px", border: "1px solid #ccc", borderRadius: "8px", }}>
        <FormControl fullWidth variant="outlined">
            <InputLabel
                shrink
                htmlFor="outlined-read-only-input"
                style={{ fontSize: "12px", color: "#1976d2", position: "relative", top: "7px", }}
            >
                {title}
            </InputLabel>
            <TextField
                id="outlined-read-only-input"
                multiline
                minRows={4}
                maxRows={4}
                defaultValue={body}
                InputProps={{
                    readOnly: true,
                    style: { fontSize: "12px", padding: "4px 8px", color: "black", backgroundColor: "floralwhite", },
                }}
                variant="standard"
                fullWidth
                classes={{ root: useStyles().customOutlinedInputRoot }}
            />
        </FormControl>
    </Box>
const SbsFact = ({ sbsFact, scoreChangeCb }: { sbsFact: ISbsFactType; scoreChangeCb: (newScore: number) => void }) => {
    return (
        <Box width="99%">
            <Grid container spacing={2}>
                <Grid item xs={5}>
                    <SbsSubFact title={`Reference: ${sbsFact.id}`} body={sbsFact.document_text_reference as string} />
                </Grid>
                <Grid item xs={5}>
                    <SbsSubFact title={`Draft: ${sbsFact.id}`} body={sbsFact.draft as string} />
                </Grid>
                <Grid item xs={2}>
                    <SbsSlider
                        defaultValue={Number(sbsFact.score) || 0}
                        max={10} step={1} style={{ margin: "20px 8px", width: "80%", }} changeCb={(value) => {
                            console.log("Slider value: ", value);

                            if (scoreChangeCb) {
                                scoreChangeCb(value as number);
                            }
                        }} />
                    <Typography id="slider-label" gutterBottom style={{ margin: "0 8px", width: "80%", textAlign: "center", }}>
                        Score
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SbsFact;