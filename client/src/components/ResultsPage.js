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

    //BreadCrumbNav//
        const breadcrumbPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Location', path: '/residential/location' },
        { name: 'Appliances', path: '/residential/appliances' },
        { name: 'Calculation', path: '/residential/calculation' },
        { name: "Results Page", path: '/residential/results'},
    ];

    return (
        <Grid container bgcolor="#EEEEEE" minHeight="calc(100vh - 90px)" p={4}>
            <Box sx={{ padding: 2, paddingBottom: 2,  alignSelf: 'flex-start' }}>
                <BreadcrumbNav paths={breadcrumbPaths} />
                </Box>

            {/*Savings*/}
            <Grid item xs={12}>
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
                        maxWidth: "400px",
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
                                datasets: [
                                    {
                                        label: "Outside Air Temperature",
                                        data: normalResults.outdoorTemp.map(cToF),
                                        borderColor: "#DC3912",
                                        backgroundColor: "#DC391280",
                                        order: 1,
                                    },
                                    {
                                        label: "Inside Temperature",
                                        data: normalResults.indoorTemp.map(cToF),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        order: 1,
                                    },
                                    {
                                        label: "Setpoint",
                                        data: normalResults.setpoint.map(cToF),
                                        borderColor: "#109618",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        order: 0,
                                    },
                                ],
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
                                            text: "Temperature (°C)",
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
                                datasets: [
                                    {
                                        label: "Outside Air Temperature",
                                        data: drResults.outdoorTemp.map(cToF),
                                        borderColor: "#DC3912",
                                        backgroundColor: "#DC391280",
                                        order: 1,
                                    },
                                    {
                                        label: "Inside Temperature",
                                        data: drResults.indoorTemp.map(cToF),
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        order: 1,
                                    },
                                    {
                                        label: "Setpoint",
                                        data: drResults.setpoint.map(cToF),
                                        borderColor: "#109618",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        order: 0,
                                    },
                                    {
                                        label: "Effective Setpoint",
                                        data: drResults.effectiveSetpoint.map(cToF),
                                        borderColor: "#990099",
                                        pointRadius: 0,
                                        borderWidth: 2,
                                        borderDash: [10, 5],
                                        stepped: true,
                                        order: 0,
                                    },
                                ],
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
                                            text: "Temperature (°C)",
                                        },
                                    },
                                },
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Power Consumption Chart */}
            <Grid container justifyContent="center" sx={{ marginTop: 4 }}>
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
                                        data: normalResults.powerConsumption,
                                        borderColor: "#3366CC",
                                        backgroundColor: "#3366CC80",
                                        pointRadius: 0,
                                        stepped: true,
                                        borderWidth: 2,
                                        order: 1
                                    },
                                    {
                                        label: "DR Power Consumption",
                                        data: drResults.powerConsumption,
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
