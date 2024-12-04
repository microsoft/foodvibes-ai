import React from 'react';
import { Box, TextField, Checkbox, Slider, Grid, Typography } from '@material-ui/core';
import { ISbsFactType } from '@foodvibes/utils/commonTypes';
import SbsSlider from './sbsSlider';

const SbsFact = ({ sbsFact, scoreChangeCb }: { sbsFact: ISbsFactType; scoreChangeCb: (newScore: number) => void }) => {
    return (
        <Box width="100%">
            <Grid container spacing={2}>
                <Grid item xs={5}>
                    <TextField
                        label={`Reference: ${sbsFact.id}`}
                        multiline
                        minRows={4}
                        maxRows={4}
                        defaultValue={sbsFact.document_text_reference}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={5}>
                    <TextField
                        label={`Draft: ${sbsFact.id}`}
                        multiline
                        minRows={4}
                        maxRows={4}
                        defaultValue={sbsFact.draft}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={2}>
                    <SbsSlider
                        defaultValue={sbsFact.score as number}
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