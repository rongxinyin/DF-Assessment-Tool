import React from "react";
import {
    Box,
    Button,
    Grid,
    Typography,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';

export default function NewResults() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const hours = [];
    for (let i = 0; i < 24; i++)
        hours.push(i);

    // Sample data
    const setpoint = 24;
    const offset = 2;
    const oat = [];
    for (let i = 0; i < 24; i++)
        oat.push(32 - 8 * Math.cos(Math.PI * i / 12));
    const indoorTemp = [];
    for (let i = 0; i < 6; i++)
        indoorTemp.push(20 + Math.pow(i / 6, 2) * 4);
    for (let i = 6; i < 24; i++)
        indoorTemp.push(23.5 + Math.random());

    const indoorTempDR = [];
    for (let i = 0; i < 8; i++)
        indoorTempDR.push(20 + Math.pow(i / 6, 2) * 4);
    for (let i = 6; i < 24; i++)
        indoorTempDR.push(25.5 + Math.random());

    const handleExport = () => {
        alert("Export feature not implemented yet.");
    };

    return (
        <Box bgcolor="#073a41" minHeight="100vh" p={isMobile ? 2 : 4}>
            {/* Graph Section */}
            <Grid
                container
                spacing={4}
                justifyContent="center"
                alignItems="center"
                mt={5}
            >
                <Grid item xs={12} md={5}>
                    <Typography
                        variant="h5"
                        color="common.white"
                        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
                    >
                        Normal Plot
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "8px",
                            width: "100%",
                            borderRadius: "8px",
                        }}>
                        <Line data={{
                            labels: hours,
                            datasets: [
                                {
                                    label: 'Outside Air Temperature',
                                    data: oat,
                                    borderColor: '#DC3912',
                                    backgroundColor: '#DC391280',
                                    order: 1
                                },
                                {
                                    label: 'Inside Temperature',
                                    data: indoorTemp,
                                    borderColor: '#3366CC',
                                    backgroundColor: '#3366CC80',
                                    order: 1
                                },
                                {
                                    label: 'Setpoint',
                                    data: new Array(24).fill(setpoint),
                                    borderColor: '#109618',
                                    pointRadius: 0,
                                    borderWidth: 2,
                                    borderDash: [10, 5],
                                    order: 0
                                }
                            ],
                        }}
                            options={{
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Hour'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Temperature (°C)'
                                        },
                                        min: 10.0,
                                        max: 45.0
                                    }
                                }

                            }}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Typography
                        variant="h5"
                        color="common.white"
                        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
                    >
                        DR Plot
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "8px",
                            width: "100%",
                            borderRadius: "8px",
                        }}>
                        <Line data={{
                            labels: hours,
                            datasets: [
                                {
                                    label: 'Outside Air Temperature',
                                    data: oat,
                                    borderColor: '#DC3912',
                                    backgroundColor: '#DC391280',
                                    order: 1
                                },
                                {
                                    label: 'Inside Temperature',
                                    data: indoorTempDR,
                                    borderColor: '#3366CC',
                                    backgroundColor: '#3366CC80',
                                    order: 1
                                },
                                {
                                    label: 'Setpoint',
                                    data: new Array(24).fill(setpoint),
                                    borderColor: '#109618',
                                    pointRadius: 0,
                                    borderWidth: 2,
                                    borderDash: [10, 5],
                                    order: 0
                                },
                                {
                                    label: 'Effective Setpoint',
                                    data: new Array(24).fill(setpoint + offset),
                                    borderColor: '#990099',
                                    pointRadius: 0,
                                    borderWidth: 2,
                                    borderDash: [10, 5],
                                    order: 0
                                }
                            ],
                        }}
                            options={{
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Hour'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Temperature (°C)'
                                        },
                                        min: 10.0,
                                        max: 45.0
                                    }
                                }

                            }}
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Bottom Buttons */}
            <Grid container spacing={2} mt={5} px={isMobile ? 2 : 10}>
                <Grid item>
                    <Button
                        variant="contained"
                        onClick={() => navigate(-1)}
                        sx={{ backgroundColor: "#cde6ef", color: "black", fontWeight: "bold" }}
                    >
                        Back
                    </Button>
                </Grid>
                <Grid item xs />
                <Grid item>
                    <Button
                        variant="contained"
                        onClick={handleExport}
                        sx={{ backgroundColor: "#cde6ef", color: "black", fontWeight: "bold" }}
                    >
                        Export
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}
