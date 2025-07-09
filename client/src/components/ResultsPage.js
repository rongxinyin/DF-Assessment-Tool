import React from "react";
import {
    Box,
    Button,
    Grid,
    Typography,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { Line } from 'react-chartjs-2';
import { BackButton , BreadcrumbNav } from './NavButtons.js';
import { useLocation } from "react-router-dom";
import ApplianceSelector from "./Appliances.js";

export default function NewResults() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const location = useLocation();
    const inputs = location.state || {};

    const{
        houseType,
        city,
        state,
        resType,
        floorArea,
        oat:inputOAT,
        appliance,
        brand,
        model,
        normalSetpoint,
        drSetpoint,
        timeStart,
        timeEnd,
    }= inputs;

    const hours = [];
    for (let i = 0; i < 24; i++)
        hours.push(i);

    // Sample data
    const setpointF = parseFloat(normalSetpoint);
    const drSetF = parseFloat(drSetpoint);

    const setpoint = isNaN(setpointF) ? 24 : ((setpointF -32)* 5) /9;
    const drSet = isNaN(drSetF) ? setpoint + 2: ((drSetF - 32)* 5) /9;
    const offset = drSet - setpoint;

    const oat = inputOAT || Array.from({ length:24}, (_, i) => 32-8 * Math.cos(Math.PI * i / 12)); //fall back values for graph
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
        <Grid container bgcolor="#EEEEEE" minHeight="calc(100vh - 90px)" p={4}>
            {/* Graph Section */}
            <Grid
                item
                container
                spacing={4}
                justifyContent="center"
                alignItems="center"
            >
                <Grid item xs={12} md={5}>
                    <Typography
                        variant="h5"
                        color="#000000"
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
                        color="#000000"
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

            <Grid container marginTop="auto">
                <Grid item xs={6}>
                    <BackButton 
                    path="/residential/calculation"
                    state={inputs} 
                    />
                </Grid>
                <Grid item xs={6}>
                    <Grid sx={{ marginLeft: "auto", width: "25%" }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                marginTop: 4,
                                marginRight: 2,
                                width: "100%",
                                height: "50px",
                            }}
                            onClick={() => handleExport()}
                        >Export</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}