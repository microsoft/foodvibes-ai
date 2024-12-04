import React from 'react';
import { Box, TextField, Checkbox, Slider, Grid, Typography } from '@material-ui/core';
import { ISbsFactType } from '@foodvibes/utils/commonTypes';

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
                    <Slider
                        style={{ margin: "40px 12px 0", width: "80%" }}
                        defaultValue={sbsFact.score}
                        min={0}
                        max={10}
                        aria-labelledby="slider-label"
                        valueLabelDisplay="on"
                        onChange={(event, value) => {
                            console.log("Slider value: ", value);

                            if (scoreChangeCb) {
                                scoreChangeCb(value as number);
                            }
                        }}
                    />
                    <Typography id="slider-label" gutterBottom>
                        Score
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SbsFact;