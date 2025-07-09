import React, { useState, useEffect } from "react";
import {
    Button,
    Slider,
    Grid
} from '@mui/material';
import { BackButton, NextButton } from './NavButtons.js';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResidentialLanding() {
    const navigate = useNavigate();
    const location = useLocation();
    const inputs = location.state || {};

    const [form, setForm] = useState({
        normalSetpoint: location.state?.normalSetpoint || "",
        drSetpoint: location.state?.drSetpoint || "",
        timeStart: location.state?.timeStart || "9 am",
        timeEnd: location.state?.timeEnd || "5 pm",
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
        const parseHour = (str) => {
            if (!str) return null;
            const [hour, period] = str.split(" ");
            let h = parseInt(hour);
            if (period.toLowerCase() === "pm" && h !== 12) h += 12;
            if (period.toLowerCase() === "am" && h === 12) h = 0;
            return h;
        };
        const start = parseHour(location.state?.timeStart) ?? 9;
        const end = parseHour(location.state?.timeEnd) ?? 17;
        return [start, end];
        
    });

    // Update form state when timeRange changes
    useEffect(() => {
        const hourToString = (hour) => {
            const h = hour % 12 === 0 ? 12 : hour % 12;
            const period = hour < 12 ? 'am' : 'pm';
            return `${h} ${period}`;
        };
        setForm(prev => ({
            ...prev,
            timeStart: hourToString(timeRange[0]),
            timeEnd: hourToString(timeRange[1])
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

    const textFieldInputPropsSX = {
        sx: {
            color: "#FFFFFF",
        },
    };

    const textFieldSX = {
        width: "100%",
        marginBottom: 1,
        marginTop: 1,
        border: "0.5px solid #636363",
        backgroundColor: "secondary.main",
        borderRadius: "10px",
    };

    // style for input and select fields
    const inputStyle = {
        width: "100%",
        padding: "0.6rem 0.75rem",
        borderRadius: "10px",
        border: "0.5px solid #636363",
        backgroundColor: "#00858C",
        color: "typography.primary.main",
        fontSize: "1rem",
    };

    // return what user sees
    return (
        <div style={{ backgroundColor: "#EEEEEE", minHeight: "calc(100vh - 90px)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Input rectangle */}
            <div style={{
                backgroundColor: "#FFFFFF",
                width: "80%",
                height: "350px",
                padding: "2rem",
                marginTop: "10rem",
                borderRadius: "10px"
            }}>
                <h2 style={{ color: "#000000", marginBottom: "1rem", textAlign: "center" }}>Residential Calculator</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ color: "#000000" }}>Temperature Set Point (°F)</label>
                        <input
                            type="number"
                            name="normalSetpoint"
                            value={form.normalSetpoint || ""}
                            onChange={e => setForm({ ...form, normalSetpoint: e.target.value })}
                            style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                        />
                    </div>

                    <div>
                        <label style={{ color: "#000000" }}>Adjusted Set Point (°F)</label>
                        <input
                            type="number"
                            name="drSetpoint"
                            value={form.drSetpoint || ""}
                            onChange={e => setForm({ ...form, drSetpoint: e.target.value })}
                            style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                        />
                    </div>

                    <div style={{ gridColumn: "1 / 3", padding: "0 1rem", marginTop: "2rem" }}>
                        <label style={{ color: "#000000" }}>Time Period</label>
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
                            marks={hours}
                            mi={0}
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
                    </div>
                </div>
            </div>

            {/* Calculate button */}
            <Button
                variant="contained"
                onClick={() => 
                    navigate("/residential/results", {
                        state: {
                            ...inputs,
                            ...form,
                        },
                    })
                }
                sx={{
                    marginTop: "2rem",
                    width: "200px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                }}
                disabled={!form.normalSetpoint}
            >
                Calculate
            </Button>

            <Grid container width="100%" marginTop="auto" padding={4}>
                <Grid item xs={6}>
                    <BackButton 
                    path="/residential/appliances/"
                    state={{
                        ...inputs,
                        ...form,
                    }} 
                />
                </Grid>
                <Grid item xs={6}>
                </Grid>
            </Grid>
        </div>
    );
}
