import {
    Box,
    Grid,
    Typography,
    Button,
    FormControl,
    TextField,
    Select,
    MenuItem,
} from '@mui/material';
import { BackButton, NextButton, BreadcrumbNav } from './NavButtons.js';

import { DropDownIcon } from './DropDownIcon.js';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTemps } from '../logic/ACFunctions.js';



export default () => {
    const location = useLocation();
    const inputs = location.state || {};
    const [homeAge, setHomeAge] = useState(inputs.homeAge || 'new'); //new
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);


    const textFieldSX = {
        width: "100%",
        marginBottom: 1,
        marginTop: 1,
        border: "2px solid #636363",
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
    };

    const textFieldInputPropsSX = {
        sx: {
            color: "#000000",
        },
    };

    const formControlSX = {
        width: "100%",
        marginBottom: 1,
    };

    const [zip, setZip] = useState(inputs.zip || '');
    const [resType, setResType] = useState(inputs.resType || '');
    const [floorArea, setFloorArea] = useState(inputs.floorArea || 0);

    const [oat, setOat] = useState(inputs.oat || []);

    const [nextDisabled, setNextDisabled] = useState(true);

    const submitData = async () => {
        const temps = await getTemps(zip);
            setOat(temps);
            setSubmitted(true);
            setNextDisabled(!(zip && resType && floorArea));
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
            <Grid container spacing={0} height="calc(100vh - 90px)">
                <Grid
                    item
                    container
                    md={6}
                    xs={12}
                    bgcolor="#FFFFFF"
                    direction="column"
                    padding={4}
                >
                    <form>
                        <Typography
                            variant="h4"
                            color="black.main"
                            sx={{ fontWeight: "bold", m: 1 }}
                        >
                            Location
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl sx={formControlSX}>
                                    <Typography
                                        variant="body2"
                                        color="typography.primary.main"
                                        sx={{ fontWeight: "bold", marginLeft: 1 }}
                                    >
                                        ZIP Code
                                    </Typography>
                                    <TextField
                                        id="outlined-basic"
                                        variant="outlined"
                                        autoComplete="off"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                        sx={textFieldSX}
                                        inputProps={textFieldInputPropsSX}
                                    />
                                </FormControl>
                            </Grid>

                           {/*new*/}
                            <Grid item xs={12}>
                                <FormControl sx={formControlSX}>
                                    <Typography
                                        variant="body2"
                                        color="typography.primary.main"
                                        sx={{ fontWeight: "bold", marginLeft: 1 }}
                                    >
                                        Home Age
                                    </Typography>
                                    <Select
                                        value={homeAge}
                                        onChange={(e) => setHomeAge(e.target.value)}
                                        sx={textFieldSX}
                                        inputProps={textFieldInputPropsSX}
                                        IconComponent={DropDownIcon}
                                    >
                                        <MenuItem value="new">New Home</MenuItem>
                                        <MenuItem value="old">Old Home</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>


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
                                        color="secondary"
                                        sx={textFieldSX}
                                        inputProps={textFieldInputPropsSX}
                                        IconComponent={DropDownIcon}
                                    >
                                        <MenuItem value={"SFH"}>Single Family Home</MenuItem>
                                        <MenuItem value={"apartment"}>Apartment</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl sx={formControlSX}>
                                    <Typography
                                        variant="body2"
                                        color="typography.primary.main"
                                        sx={{ fontWeight: "bold", marginLeft: 1 }}
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

                            <Button
                                variant="contained"
                                sx={{
                                    color: "#000000",
                                    backgroundColor: "#EEEEEE",
                                    marginTop: 2,
                                    marginBottom: 3,
                                    width: "25%",
                                    height: "50px",
                                }}
                                onClick={submitData}
                            >
                                Go
                            </Button>
                        </Grid>
                    </form>

                    <BackButton
                        path="/residential/house_type"
                        state={{
                            ...inputs,
                            zip,
                            resType,
                            floorArea,
                            oat,
                        }}
                    />
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
                        sx={{ width: "100%", textAlign: "center", fontWeight: "bold", m: 1 }}
                    >
                        OAT Graph
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: "white.main",
                            borderRadius: "8px",
                            width: "100%",
                            borderRadius: "8px",
                        }}>
                        <Line data={{
                            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                            datasets: [
                                {
                                    label: 'Outside Air Temperature',
                                    data: oat
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

                    //new
                    {submitted && (
                      <>
                        <Typography
                            variant="h5"
                            sx={{ mt: 4, mb: 2, fontWeight: "bold", textAlign: "center" }}
                        >
                            Home Characteristics
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: "#fff",
                                padding: 2,
                                borderRadius: "8px",
                                width: "100%",
                                boxShadow: 1,
                            }}
                        >
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                                        <th style={{ padding: '8px' }}>Property</th>
                                        <th style={{ padding: '8px' }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px' }}>Thermal Resistance</td>
                                        <td style={{ padding: '8px' }}>
                                            {homeAge === 'new' ? '2.0 K/kW' : '2.0 K/kW'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px' }}>Thermal Capacitance</td>
                                        <td style={{ padding: '8px' }}>
                                            {homeAge === 'new' ? '5.0 kWh/K' : '5.0 kWh/K'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Box>
                      </>
                    )}


                    <NextButton
                        path="/residential/appliances"
                        disabled={nextDisabled}
                        state={{
                            ...inputs,
                            zip,
                            resType,
                            floorArea,
                            oat,
                            homeAge, //new
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}
