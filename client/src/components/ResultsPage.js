import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Grid,
    Typography,
    Menu,
    MenuItem
} from "@mui/material";
import { Line } from 'react-chartjs-2';
import { BackButton, BreadcrumbNav } from './NavButtons.js';
import { useLocation } from "react-router-dom";
import { calculateACDR, calculateWaterHeaterDR } from '../logic/ACFunctions.js';

export default function NewResults() {
    const location = useLocation();
    const inputs = location.state || {};
    const { appliance } = inputs;

    const hours = [];
    for (let i = 0; i < 24; i++)
        hours.push(i);

    const [normalResults, setNormalResults] = useState({
        indoorTemp: [], outdoorTemp: [], setpoint: [], effectiveSetpoint: [], waterTemp: [], ambientTemp: [], powerConsumption: []
    });
    const [normalEnergy, setNormalEnergy] = useState(0);
    const [drResults, setDRResults] = useState({
        indoorTemp: [], outdoorTemp: [], setpoint: [], effectiveSetpoint: [], waterTemp: [], ambientTemp: [], powerConsumption: []
    });
    const [drEnergy, setDREnergy] = useState(0);

    useEffect(() => {
        async function fetchResults() {
            if (appliance === 'Air conditioner') {
                calculateACDR(inputs).then(data => {
                    setNormalResults(data.normalResults);
                    setDRResults(data.drResults);
                    setNormalEnergy(data.normalEnergy);
                    setDREnergy(data.drEnergy);
                });
            } else if (appliance === 'Water heater') {
                calculateWaterHeaterDR(inputs).then(data => {
                    console.log(data)
                    setNormalResults(data.normalResults);
                    setDRResults(data.drResults);
                    setNormalEnergy(data.normalEnergy);
                    setDREnergy(data.drEnergy);
                }).catch(err => {
                    console.error('Failed to fetch water heater results:', err);
                });
            } else {
                console.error('Unknown appliance type');
                return;
            }
        }

        fetchResults();
    }, []);


    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const savings = normalEnergy - drEnergy;
    const csv =
        `Normal energy (kWh),DR energy (kWh),Savings (kWh),Savings (%),Savings ($)
${normalEnergy},${drEnergy},${savings},${savings / normalEnergy * 100},${savings * 0.50}`;
    const csvBlobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/plain' }))
    const json = {
        input: inputs,
        output: {
            normalEnergy,
            normalResults,
            drEnergy,
            drResults,
            savings: {
                energy: savings,
                percent: 100 * savings / normalEnergy,
                dollars: savings * 0.50
            }
        }
    };
    const jsonBlobUrl = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }));

    // Celsius to Fahrenheit
    const cToF = c => c * 9 / 5 + 32;
    const averageHours = array => {
        const intervalLength = Math.round(array.length / 24);

        const hours = [];
        let total = 0, count = 0;
        for (let i = 0; i < array.length; i++) {
            total += array[i];
            count++;

            if (count >= intervalLength) {
                hours.push(total / count);
                total = 0;
                count = 0;
            }
        }

        return hours;
    };

    //BreadCrumbNav//
    const breadcrumbPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Location', path: '/residential/location' },
        { name: 'Appliances', path: '/residential/appliances' },
        { name: 'Calculation', path: '/residential/calculation' },
        { name: "Results Page", path: '/residential/results' },
    ];

    const exportLinkStyle = {
        color: 'inherit',
        textDecoration: 'none'
    }

    return (
        <Grid container bgcolor="#EEEEEE" minHeight="calc(100vh - 90px)" p={4}>
            <Box sx={{ padding: 2, paddingBottom: 2, alignSelf: 'flex-start' }}>
                <BreadcrumbNav paths={breadcrumbPaths} />
            </Box>


            {/* Graph Section */}
            <Grid
                item
                container
                spacing={4}
                justifyContent="center"
                alignItems="flex-start"
                sx={{ marginTop: "2rem" }}
            >

                {/* Normal Plot */}
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
                        }}
                    >

                        <Line

                            data={{
                                labels: hours,
                                datasets: appliance === 'Air conditioner' ? [
                                    {
                                        label: "Outside Air Temperature",
                                        data: averageHours(normalResults.outdoorTemp).map(cToF),
                                        borderColor: "#DC3912",
                                        backgroundColor: "#DC391280",
                                        order: 1,
                                    },
                                    {
                                        label: "Inside Temperature",
                                        data: averageHours(normalResults.indoorTemp).map(cToF),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        order: 1,
                                    },
                                    {
                                        label: "Setpoint",
                                        data: averageHours(normalResults.setpoint).map(cToF),
                                        borderColor: "#109618",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        order: 0,
                                    },
                                    {
                                        label: "Effective Setpoint",
                                        data: averageHours(normalResults.effectiveSetpoint).map(cToF),
                                        borderColor: "#990099",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        stepped: true,
                                        order: 0,
                                    },
                                ] : [ // Water heater graph
                                    {
                                        label: "Ambient Temperature",
                                        data: averageHours(normalResults.ambientTemp),
                                        borderColor: "#DC3912",
                                        backgroundColor: "#DC391280",
                                        order: 1,
                                    },
                                    {
                                        label: "Water Temperature",
                                        data: averageHours(normalResults.waterTemp),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        order: 1,
                                    },
                                    {
                                        label: "Setpoint",
                                        data: averageHours(normalResults.setpoint),
                                        borderColor: "#109618",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        order: 0,
                                    },
                                    {
                                        label: "Effective Setpoint",
                                        data: averageHours(normalResults.effectiveSetpoint),
                                        borderColor: "#990099",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        stepped: true,
                                        order: 0,
                                    },
                                ]
                            }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: "Temperature",
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Hour",
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Temperature (°F)",
                                        },
                                    },
                                },
                            }}

                        />


                    </Box>
                </Grid>

                {/* DR Plot */}
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
                        }}
                    >

                        <Line

                            data={{
                                labels: hours,
                                datasets: appliance === 'Air conditioner' ? [
                                    {
                                        label: "Outside Air Temperature",
                                        data: averageHours(drResults.outdoorTemp).map(cToF),
                                        borderColor: "#DC3912",
                                        backgroundColor: "#DC391280",
                                        order: 1,
                                    },
                                    {
                                        label: "Inside Temperature",
                                        data: averageHours(drResults.indoorTemp).map(cToF),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        order: 1,
                                    },
                                    {
                                        label: "Setpoint",
                                        data: averageHours(drResults.setpoint).map(cToF),
                                        borderColor: "#109618",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        order: 0,
                                    },
                                    {
                                        label: "Effective Setpoint",
                                        data: averageHours(drResults.effectiveSetpoint).map(cToF),
                                        borderColor: "#990099",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        stepped: true,
                                        order: 0,
                                    },
                                ] : [ // Water heater graph
                                    {
                                        label: "Ambient Temperature",
                                        data: averageHours(drResults.ambientTemp),
                                        borderColor: "#DC3912",
                                        backgroundColor: "#DC391280",
                                        order: 1,
                                    },
                                    {
                                        label: "Water Temperature",
                                        data: averageHours(drResults.waterTemp),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        order: 1,
                                    },
                                    {
                                        label: "Setpoint",
                                        data: averageHours(drResults.setpoint),
                                        borderColor: "#109618",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        order: 0,
                                    },
                                    {
                                        label: "Effective Setpoint",
                                        data: averageHours(drResults.effectiveSetpoint),
                                        borderColor: "#990099",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        stepped: true,
                                        order: 0,
                                    },
                                ]
                            }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: "Temperature",
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Hour",
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Temperature (°F)",
                                        },
                                    },
                                },
                            }}

                        />

                    </Box>
                </Grid>
            </Grid>

            {/* Savings and Power Consumption next to each other */}
            <Grid
                item
                container
                spacing={4}
                justifyContent="center"
                alignItems="stretch"
                sx={{ marginTop: "2rem" }}
            >
                {/* Savings Box */}
                <Grid
                    item
                    xs={12}
                    md={5}
                    sx={{ display: "flex", flexDirection: "column", height: "100%" }}
                >
                    <Typography
                        variant="h5"
                        color="#000000"
                        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
                    >
                        Savings
                    </Typography>

                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "12px",
                            padding: "1rem 1rem",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            marginX: "auto",
                            width: "100%",
                            flexGrow: 1,
                            //maxWidth: "400px",
                        }}
                    >
                        <Typography fontWeight="bold" textAlign="center" mb={0.5}>
                            Normal Energy Usage:
                        </Typography>
                        <Typography textAlign="center" mb={1}>
                            {Math.round(normalEnergy * 100) / 100}kWh
                        </Typography>

                        <Typography fontWeight="bold" textAlign="center" mb={0.5}>
                            DR Energy Usage:
                        </Typography>
                        <Typography textAlign="center" mb={1}>
                            {Math.round(drEnergy * 100) / 100}kWh
                        </Typography>

                        <Typography fontWeight="bold" textAlign="center" mb={0.5}>
                            Savings:
                        </Typography>
                        <Typography textAlign="center">
                            {Math.round((normalEnergy - drEnergy) * 100) / 100}kWh (
                            {normalEnergy !== 0
                                ? Math.round(((normalEnergy - drEnergy) / normalEnergy) * 10000) / 100
                                : "0"
                            }%)
                            <span> - </span>
                            <span style={{ color: "green", fontWeight: "bold" }}>
                                ${Math.round((normalEnergy - drEnergy) * 0.50 * 100) / 100}/day
                            </span>
                        </Typography>
                    </Box>
                </Grid>

                {/* Power Consumption Chart */}
                <Grid item xs={12} md={5}>
                    <Typography
                        variant="h5"
                        color="#000000"
                        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
                    >
                        Power Consumption
                    </Typography>

                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "8px",
                            width: "100%",
                            padding: "1rem",
                            margin: "0 auto",
                        }}
                    >
                        <Line
                            data={{
                                labels: hours,
                                datasets: [
                                    {
                                        label: "Normal Power Consumption",
                                        data: averageHours(normalResults.powerConsumption),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        pointRadius: 0,
                                        stepped: true,
                                        borderWidth: 2,
                                        order: 1
                                    },
                                    {
                                        label: "DR Power Consumption",
                                        data: averageHours(drResults.powerConsumption),
                                        borderColor: "#990099",
                                        backgroundColor: "#99009980",
                                        pointRadius: 0,
                                        stepped: true,
                                        borderDash: [5, 5],
                                        borderWidth: 2,
                                        order: 0
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: "Power Consumption",
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Hour",
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Power Consumption (kW)",
                                        },
                                    },
                                },
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
                            id="export-button"
                            variant="contained"
                            color="secondary"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                            sx={{
                                marginTop: 4,
                                marginRight: 2,
                                width: "100%",
                                height: "50px",
                            }}
                        >Export</Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            slotProps={{
                                list: {
                                    "aria-labelledby": "export-button"
                                }
                            }}>
                            <MenuItem onClick={handleClose}>
                                <a style={exportLinkStyle} href={csvBlobUrl} download="dr_estimate.csv">CSV</a>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <a style={exportLinkStyle} href={jsonBlobUrl} download="dr_estimate.json">JSON</a>
                            </MenuItem>
                        </Menu>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
