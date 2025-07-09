import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Grid,
    Typography,
} from "@mui/material";
import { Line } from 'react-chartjs-2';
import { BackButton, BreadcrumbNav } from './NavButtons.js';
import { useLocation } from "react-router-dom";
import { calculateDR } from '../logic/ACFunctions.js';

export default function NewResults() {
    const location = useLocation();
    const inputs = location.state || {};

    const {
        houseType,
        city,
        state,
        resType,
        floorArea,
        appliance,
        brand,
        model,
        normalSetpoint,
        drSetpoint,
        timeStart,
        timeEnd,
    } = inputs;

    const hours = [];
    for (let i = 0; i < 24; i++)
        hours.push(i);

    // Sample data
    const setpointF = parseFloat(normalSetpoint);
    const drSetF = parseFloat(drSetpoint);

    const setpoint = isNaN(setpointF) ? 24 : ((setpointF - 32) * 5) / 9;
    const drSet = isNaN(drSetF) ? setpoint + 2 : ((drSetF - 32) * 5) / 9;
    const offset = drSet - setpoint;

    const indoorTemp = [];
    for (let i = 0; i < 6; i++)
        indoorTemp.push(20 + Math.pow(i / 6, 2) * 4);
    for (let i = 6; i < 24; i++)
        indoorTemp.push(23.5 + Math.random());

    const [normalResults, setNormalResults] = useState({
        indoorTemp: [],
        outdoorTemp: [],
        setpoint: [],
        powerConsumption: [],
    });
    const [normalEnergy, setNormalEnergy] = useState(0);
    const [drResults, setDRResults] = useState({
        indoorTemp: [],
        outdoorTemp: [],
        setpoint: [],
        effectiveSetpoint: [],
        powerConsumption: [],
    });
    const [drEnergy, setDREnergy] = useState(0);

    useEffect(() => {
        calculateDR(inputs).then(data => {
            setNormalResults(data.normalResults);
            setDRResults(data.drResults);
            setNormalEnergy(data.normalResults.powerConsumption.reduce((a, c) => a + c));
            setDREnergy(data.drResults.powerConsumption.reduce((a, c) => a + c));
        });
    }, []);

    const handleExport = () => {
        alert("Export feature not implemented yet.");
    };

    // Celsius to Fahrenheit
    const cToF = c => c * 9 / 5 + 32;

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
                    {/* Normal power plot */}
                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "8px",
                            width: "100%",
                        }}>
                        <Line data={{
                            labels: hours,
                            datasets: [
                                {
                                    label: 'Outside Air Temperature',
                                    data: normalResults.outdoorTemp.map(cToF),
                                    borderColor: '#DC3912',
                                    backgroundColor: '#DC391280',
                                    order: 1
                                },
                                {
                                    label: 'Inside Temperature',
                                    data: normalResults.indoorTemp.map(cToF),
                                    borderColor: '#3366CC',
                                    backgroundColor: '#3366CC80',
                                    order: 1
                                },
                                {
                                    label: 'Setpoint',
                                    data: normalResults.setpoint.map(cToF),
                                    borderColor: '#109618',
                                    pointRadius: 0,
                                    borderWidth: 2,
                                    borderDash: [10, 5],
                                    order: 0
                                }
                            ],
                        }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Temperature'
                                    }
                                },
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
                                    }
                                }
                            }}
                        />
                    </Box>
                    {/* Normal power plot */}
                    <Box
                        marginTop={2}
                        sx={{
                            backgroundColor: "white.main",
                            width: "100%",
                            borderRadius: "8px",
                        }}>
                        <Line data={{
                            labels: hours,
                            datasets: [
                                {
                                    label: 'Power Consumption',
                                    data: normalResults.powerConsumption,
                                    borderColor: '#000000',
                                    backgroundColor: '#00000080',
                                    pointRadius: 0,
                                    stepped: true
                                },
                            ],
                        }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Power Consumption'
                                    }
                                },
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
                                            text: 'Power Consumption (kW)'
                                        },
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
                    {/* DR temperature plot */}
                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "8px",
                            width: "100%",
                        }}>
                        <Line data={{
                            labels: hours,
                            datasets: [
                                {
                                    label: 'Outside Air Temperature',
                                    data: drResults.outdoorTemp.map(cToF),
                                    borderColor: '#DC3912',
                                    backgroundColor: '#DC391280',
                                    order: 1
                                },
                                {
                                    label: 'Inside Temperature',
                                    data: drResults.indoorTemp.map(cToF),
                                    borderColor: '#3366CC',
                                    backgroundColor: '#3366CC80',
                                    order: 1
                                },
                                {
                                    label: 'Setpoint',
                                    data: drResults.setpoint.map(cToF),
                                    borderColor: '#109618',
                                    pointRadius: 0,
                                    borderWidth: 2,
                                    borderDash: [10, 5],
                                    order: 0
                                },
                                {
                                    label: 'Effective Setpoint',
                                    data: drResults.effectiveSetpoint.map(cToF),
                                    borderColor: '#990099',
                                    pointRadius: 0,
                                    borderWidth: 2,
                                    borderDash: [10, 5],
                                    order: 0
                                }
                            ],
                        }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Temperature'
                                    }
                                },
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
                                    }
                                }

                            }}
                        />
                    </Box>
                    {/* DR power plot */}
                    <Box
                        marginTop={2}
                        sx={{
                            backgroundColor: "white.main",
                            width: "100%",
                            borderRadius: "8px",
                        }}>
                        <Line data={{
                            labels: hours,
                            datasets: [
                                {
                                    label: 'Power Consumption',
                                    data: drResults.powerConsumption,
                                    borderColor: '#000000',
                                    backgroundColor: '#00000080',
                                    pointRadius: 0,
                                    stepped: true
                                },
                            ],
                        }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Power Consumption'
                                    }
                                },
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
                                            text: 'Power Consumption (kW)'
                                        },
                                    }
                                }

                            }}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={10}>
                    <Typography
                        variant="h5"
                        color="typography.primary.main"
                        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
                    >
                        Savings
                    </Typography>
                    <Box
                        marginTop={2}
                        p={1}
                        sx={{
                            backgroundColor: "white.main",
                            width: "100%",
                            borderRadius: "8px",
                        }}>
                        <Grid container>
                            <Grid item xs={12} md={6}>
                                <span style={{ fontWeight: "bold" }}>Normal energy usage: </span>
                                {Math.round(normalEnergy * 100) / 100}kWh
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <span style={{ fontWeight: "bold" }}>DR energy usage: </span>
                                {Math.round(drEnergy * 100) / 100}kWh
                            </Grid>
                            <Grid item xs={12}>
                                <span style={{ fontWeight: "bold" }}>Savings: </span>
                                {Math.round((normalEnergy - drEnergy) * 100) / 100}kWh ({Math.round((normalEnergy - drEnergy) / normalEnergy * 10000) / 100}%) - ${(Math.round((normalEnergy - drEnergy) * 0.50 * 100) / 100).toFixed(2)}/day {/* $0.50 per kWh */}
                            </Grid>
                        </Grid>
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
