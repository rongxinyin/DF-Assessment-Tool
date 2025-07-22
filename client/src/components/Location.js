import React, { useState } from 'react';
import { getZipState, getClimateZone, getTemps } from '../logic/ACFunctions.js';
import {
    Box,
    Grid,
    Typography,
    Button,
    FormControl,
    TextField,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { BackButton, NextButton, BreadcrumbNav } from './NavButtons.js';
import { Line } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';

export default () => {
    const location = useLocation();
    const inputs = location.state || {};
    const houseType = inputs.houseType || 'individual';
    const [homeAge, setHomeAge] = useState(inputs.homeAge || 'new');
    const [zip, setZip] = useState(inputs.zip || '');
    const [resType, setResType] = useState(inputs.resType || '');
    const [floorArea, setFloorArea] = useState(inputs.floorArea || 0);
    const [oat, setOat] = useState(inputs.oat || []);
    const [state, setState] = useState(inputs.state || '');
    const [climateZone, setClimateZone] = useState(inputs.climateZone || '');
    const [submitted, setSubmitted] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(true);
    const [error, setError] = useState(null); const [apartmentCount, setApartmentCount] = useState(inputs.apartmentCount)

    const textFieldSX = {
        marginBottom: 1,
        marginTop: 1,
        /*
    border: '2px solid #636363',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    */
    };

    const formControlSX = {
        width: '100%',
        marginBottom: 1,
    };

    const submitData = async () => {
        if (!zip) {
            setError('Please enter a ZIP code');
            return;
        }
        if (!/^\d{5}$/.test(zip)) {
            setError('Please enter a valid 5-digit ZIP code');
            return;
        }
        try {
            const [temps, zipStateData, climateZoneData] = await Promise.all([
                getTemps(zip),
                getZipState(zip),
                getClimateZone(zip),
            ]);
            setOat(temps);
            setState(zipStateData.state || 'N/A');
            setClimateZone(climateZoneData.climateZone || 'N/A');
            setError(null);
            setSubmitted(true);
            setNextDisabled(!(zip && (resType || apartmentCount)));
        } catch (err) {
            setError(`Failed to fetch data: ${err.message}`);
            console.error('Submit error:', err);
            setOat([]);
            setState('');
            setClimateZone('');
            setSubmitted(false);
            setNextDisabled(true);
        }
    };

    const breadcrumbPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Location', path: '/residential/location' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 90px)' }}>
            <Box sx={{ padding: 2, paddingBottom: 0.5 }}>
                <BreadcrumbNav paths={breadcrumbPaths} />
            </Box>

            <Grid container spacing={0} sx={{ flex: '1' }}>
                <Grid
                    item
                    container
                    md={6}
                    xs={12}
                    padding={4}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitData();
                        }}
                    >
                        <Typography
                            variant="h4"
                            color="black.main"
                            sx={{ fontWeight: 'bold', m: 1 }}
                        >
                            Location
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl sx={formControlSX}>
                                    <Typography
                                        variant="body2"
                                        color="typography.primary.main"
                                        sx={{ fontWeight: 'bold', marginLeft: 1 }}
                                    >
                                        ZIP code
                                    </Typography>
                                    <TextField
                                        id="outlined-basic"
                                        variant="outlined"
                                        autoComplete="off"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                        sx={textFieldSX}
                                    />
                                </FormControl>
                            </Grid>

                            {/* Home Age*/}
                            <Grid item xs={6}>
                                <FormControl sx={formControlSX}>
                                    <Typography
                                        variant="body2"
                                        color="typography.primary.main"
                                        sx={{ fontWeight: "bold", marginLeft: 1 }}
                                    >
                                        Home age
                                    </Typography>
                                    <Select
                                        value={homeAge}
                                        onChange={(e) => setHomeAge(e.target.value)}
                                        sx={textFieldSX}
                                    >
                                        <MenuItem value="new">New home</MenuItem>
                                        <MenuItem value="old">Old home</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Apartment Count*/}
                            {houseType === 'aggregator' ? (
                                <Grid item xs={6}>
                                    <FormControl sx={formControlSX}>
                                        <Typography
                                            variant="body2"
                                            color="typography.primary.main"
                                            sx={{ fontWeight: "bold", marginLeft: 1 }}
                                        >
                                            Apartment count
                                        </Typography>
                                        <TextField
                                            id="apartment-count"
                                            type="number"
                                            variant="outlined"
                                            autoComplete="off"
                                            value={apartmentCount}
                                            onChange={(e) => setApartmentCount(e.target.value)}
                                            sx={textFieldSX}
                                        />
                                    </FormControl>
                                </Grid>
                            )
                                : ( // Individual
                                    <Grid item xs={6}>
                                        <FormControl sx={formControlSX}>
                                            <Typography
                                                variant="body2"
                                                color="typography.primary.main"
                                                sx={{ fontWeight: "bold", marginLeft: 1 }}
                                            >
                                                Residence type
                                            </Typography>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={resType}
                                                onChange={e => setResType(e.target.value)}
                                                sx={textFieldSX}
                                            >
                                                <MenuItem value={"SFH"}>Single family home</MenuItem>
                                                <MenuItem value={"apartment"}>Apartment</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}

                            {/*
                            <Grid item xs={6}>
                                <FormControl sx={formControlSX}>
                                    <Typography
                                        variant="body2"
                                        color="typography.primary.main"
                                        sx={{ fontWeight: 'bold', marginLeft: 1 }}
                                    >
                                        Floor Area (ft²)
                                    </Typography>
                                    <TextField
                                        id="outlined-basic"
                                        variant="outlined"
                                        autoComplete="off"
                                        type="number"
                                        value={floorArea}
                                        onChange={(e) => setFloorArea(e.target.value)}
                                        sx={textFieldSX}
                                        inputProps={textFieldInputPropsSX}
                                    />
                                </FormControl>
                            </Grid>
                            */}

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        marginTop: 2,
                                        marginBottom: 3,
                                        width: '25%',
                                        height: '50px',
                                    }}
                                    onClick={submitData}
                                >
                                    Go
                                </Button>
                                {error && (
                                    <Typography sx={{ color: 'red', mt: 2 }}>{error}</Typography>
                                )}
                            </Grid>
                        </Grid>
                    </form>

                </Grid>

                <Grid
                    item
                    container
                    md={6}
                    xs={12}
                    bgcolor="#EEEEEE"
                    direction="column"
                    padding={4}
                >
                    <Typography
                        variant="h4"
                        color="typography.primary.main"
                        sx={{ width: '100%', textAlign: 'center', fontWeight: 'bold', m: 1 }}
                    >
                        OAT Graph
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: 'white.main',
                            borderRadius: '8px',
                            width: '100%',
                        }}
                    >
                        <Line
                            data={{
                                labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                                datasets: [
                                    {
                                        label: 'Outside Air Temperature',
                                        data: oat,
                                        borderColor: '#1976d2',
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                        fill: true,
                                    },
                                ],
                            }}
                            options={{
                                scales: {
                                    x: { title: { display: true, text: 'Hour' } },
                                    y: {
                                        title: { display: true, text: 'Temperature (°C)' },
                                        min: 10.0,
                                        max: 45.0,
                                    },
                                },
                            }}
                        />
                    </Box>

                    {submitted && (
                        <>
                            <Typography
                                variant="h5"
                                sx={{ mt: 4, mb: 2, fontWeight: 'bold', textAlign: 'center' }}
                            >
                                Home Characteristics
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: '#fff',
                                    padding: 2,
                                    borderRadius: '8px',
                                    width: '100%',
                                    boxShadow: 1,
                                }}
                            >
                                <Table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <TableHead>
                                        <TableRow sx={{ borderBottom: '2px solid #ccc' }}>
                                            <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>Property</TableCell>
                                            <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow sx={{ borderBottom: 'none' }}>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>State</TableCell>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>{state || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ borderBottom: 'none' }}>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>Climate Zone</TableCell>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>{climateZone || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ borderBottom: 'none' }}>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>Thermal Resistance</TableCell>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>
                                                {homeAge === 'new' ? '2.0 K/kW' : '1.5 K/kW'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ borderBottom: 'none' }}>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>Thermal Capacitance</TableCell>
                                            <TableCell sx={{ padding: '8px', borderBottom: 'none' }}>
                                                {homeAge === 'new' ? '5.0 kWh/K' : '4.0 kWh/K'}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>
                        </>
                    )}
                </Grid>
            </Grid>
            <Box padding={2}>
                <BackButton
                    path="/residential/house_type"
                    state={{
                        ...inputs,
                        zip,
                        resType,
                        floorArea,
                        oat,
                        houseType,
                        apartmentCount
                    }}
                />

                <NextButton
                    path="/residential/appliances"
                    disabled={nextDisabled}
                    state={{
                        ...inputs,
                        zip,
                        resType,
                        floorArea,
                        oat,
                        homeAge,
                        houseType,
                        apartmentCount
                    }}
                />
            </Box>
        </Box>
    )
}
