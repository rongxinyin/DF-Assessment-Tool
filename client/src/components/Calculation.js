import React, { useState, useEffect } from "react";
import {
    Box,
    FormControl,
    Grid,
    Slider,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import { BackButton, NextButton, BreadcrumbNav } from './NavButtons.js';
import { useLocation } from 'react-router-dom';

export default function ResidentialLanding() {
    const location = useLocation();
    const inputs = location.state || {};

    const [form, setForm] = useState({
        normalSetpoint: inputs.normalSetpoint || "",
        drSetpoint: inputs.drSetpoint || "",
        timeStart: inputs.timeStart || "9",
        timeEnd: inputs.timeEnd || "5",
    });

    // Generate hours of the day for slider marks
    const hours = Array.from({ length: 25 }, (_, i) => {
        if (i === 24) {
            return { value: 24, label: '12 AM' }; // Next day's midnight
        }
        const hour = i % 12 === 0 ? 12 : i % 12;
        const period = i < 12 ? 'AM' : 'PM';
        return { value: i, label: `${hour} ${period}` };
    });

    // Initialize time range (default: 9 am to 5 pm)
    const [timeRange, setTimeRange] = useState(() => {
        const start = inputs.timeStart || 9;
        const end = inputs.timeEnd || 17;
        return [start, end];

    });

    // Update form state when timeRange changes
    useEffect(() => {
        setForm(prev => ({
            ...prev,
            timeStart: timeRange[0],
            timeEnd: timeRange[1]
        }));
    }, [timeRange]);

    // Handle slider change with minimum distance enforcement
    const handleTimeRangeChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) return;

        if (newValue[1] - newValue[0] < 1) {
            if (activeThumb === 0) {
                const clamped = Math.min(newValue[0], 23 - 1);
                setTimeRange([clamped, clamped + 1]);
            } else {
                const clamped = Math.max(newValue[1], 1);
                setTimeRange([clamped - 1, clamped]);
            }
        } else {
            setTimeRange(newValue);
        }
    };

    const formControlSX = {
        width: '100%',
        marginBottom: 1,
    };

    const textFieldSX = {
        marginBottom: 1,
        marginTop: 1,
    };

    // https://stackoverflow.com/a/62073653
    const smallScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
    const mediumScreen = useMediaQuery(theme => theme.breakpoints.between("sm", "md"));
    const medToLargeScreen = useMediaQuery(theme => theme.breakpoints.between("md", "lg"));

    const breadcrumbPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Location', path: '/residential/location' },
        { name: 'Appliances', path: '/residential/appliances' },
        { name: 'Calculation', path: '/residential/calculation' },
    ];

    return (
        <Box style={{ backgroundColor: "#EEEEEE", minHeight: "calc(100vh - 90px)", display: "flex", flexDirection: "column" }}>
            <Box sx={{ padding: 2, paddingBottom: 2, alignSelf: 'flex-start' }}>
                <BreadcrumbNav paths={breadcrumbPaths} />
            </Box>

            <Grid item xs={12} flex={1}>
                <Box sx={{
                    margin: "auto",
                    backgroundColor: "#FFFFFF",
                    width: "80%",
                    minHeight: "350px",
                    padding: "2rem",
                    marginTop: "2rem",
                    borderRadius: "10px",
                }}>
                    <Typography
                        variant="h4"
                        color="black.main"
                        sx={{ fontWeight: 'bold', m: 1 }}
                    >
                        DR Configuration
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl sx={formControlSX}>
                                <Typography
                                    variant="body2"
                                    color="typography.primary.main"
                                    sx={{ fontWeight: 'bold', marginLeft: 1 }}
                                >
                                    Temperature set point (°F)
                                </Typography>
                                <TextField
                                    type="number"
                                    variant="outlined"
                                    autoComplete="off"
                                    value={form.normalSetpoint || ""}
                                    onChange={e => setForm({ ...form, normalSetpoint: e.target.value })}
                                    sx={textFieldSX}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl sx={formControlSX}>
                                <Typography
                                    variant="body2"
                                    color="typography.primary.main"
                                    sx={{ fontWeight: 'bold', marginLeft: 1 }}
                                >
                                    Adjusted set point (°F)
                                </Typography>
                                <TextField
                                    type="number"
                                    variant="outlined"
                                    autoComplete="off"
                                    value={form.drSetpoint || ""}
                                    onChange={e => setForm({ ...form, drSetpoint: e.target.value })}
                                    sx={textFieldSX}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <label style={{ color: "#000000" }}>Time period</label>
                            <Slider
                                value={timeRange}
                                onChange={handleTimeRangeChange}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => {
                                    const hour = value % 12 === 0 ? 12 : value % 12;
                                    const period = value < 12 ? 'AM' : 'PM';
                                    return `${hour} ${period}`;
                                }}
                                color="white"
                                marks={
                                    hours.filter((_, i) =>
                                        i % (smallScreen ? 4 : mediumScreen ? 3 : medToLargeScreen ? 2 : 1) === 0
                                    )
                                }
                                min={0}
                                max={24}
                                disableSwap
                                sx={{
                                    '& .MuiSlider-track': {
                                        backgroundColor: '#000000',
                                        border: '2px solid white',
                                    },
                                    '& .MuiSlider-rail': {
                                        backgroundColor: '#000000',
                                        opacity: 0.3,
                                    },
                                    '& .MuiSlider-thumb': {
                                        backgroundColor: 'white',
                                        border: '2px solid #000000',
                                    },
                                    '& .MuiSlider-mark': {
                                        backgroundColor: 'white',
                                    },
                                    '& .MuiSlider-markLabel': {
                                        color: '#000000',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Grid>

            <Box padding={2}>
                <BackButton
                    path="/residential/appliances/"
                    state={{
                        ...inputs,
                        ...form,
                    }}
                />

                <NextButton
                    disabled={!(form.normalSetpoint && form.drSetpoint)}
                    path="/residential/results"
                    state={{
                        ...inputs,
                        ...form,
                    }}
                />
            </Box>
        </Box>
    );
}
