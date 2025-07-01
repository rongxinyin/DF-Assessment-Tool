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
import { DropDownIcon } from './DropDownIcon.js';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

export default () => {
    const navigate = useNavigate();

    const textFieldSX = {
        width: "100%",
        marginBottom: 1,
        marginTop: 1,
        border: "2px solid #F0F0F0",
        backgroundColor: "secondary.main",
        borderRadius: "10px",
    };

    const textFieldInputPropsSX = {
        sx: {
            color: "#FFFFFF",
        },
    };

    const formControlSX = {
        width: "90%",
        marginBottom: 1,
    };

    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [resType, setResType] = useState('');
    const [floorArea, setFloorArea] = useState(0);

    const [oat, setOat] = useState([]);

    const [nextDisabled, setNextDisabled] = useState(true);

    const submitData = () => {
        const newOat = [];
        for (let i = 0; i < 24; i++)
            newOat.push(20 + 20 * Math.sin(Math.PI * i / 24))
        setOat(newOat);
        setNextDisabled(!(city && state && resType && floorArea));
    };

    return (
        <Grid container spacing={0} height="calc(100vh - 90px)">
            <Grid
                item
                container
                md={6}
                xs={12}
                bgcolor="primary.main"
                direction="column"
                padding={4}
            >
                <form>
                    <Typography
                        variant="h4"
                        color="white.main"
                        sx={{ fontWeight: "bold", m: 1 }}
                    >
                        Location
                    </Typography>

                    <Grid container spacing={0}>
                        <Grid item xs={6}>
                            <FormControl sx={formControlSX}>
                                <Typography
                                    variant="body2"
                                    color="white.main"
                                    sx={{ fontWeight: "bold", marginLeft: 1 }}
                                >
                                    City
                                </Typography>
                                <TextField
                                    id="outlined-basic"
                                    variant="outlined"
                                    autoComplete="off"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    sx={textFieldSX}
                                    inputProps={textFieldInputPropsSX}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl sx={formControlSX}>
                                <Typography
                                    variant="body2"
                                    color="white.main"
                                    sx={{ fontWeight: "bold", marginLeft: 1 }}
                                >
                                    State
                                </Typography>
                                <TextField
                                    id="outlined-basic"
                                    variant="outlined"
                                    autoComplete="off"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    sx={textFieldSX}
                                    inputProps={textFieldInputPropsSX}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl sx={formControlSX}>
                                <Typography
                                    variant="body2"
                                    color="white.main"
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
                                    color="white.main"
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
                            color="secondary"
                            sx={{
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

                <Box align="left" sx={{ marginTop: "auto", display: { xs: "none", md: "block" } }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{
                            marginTop: 4,
                            marginRight: 2,
                            width: "25%",
                            height: "50px",
                        }}
                        onClick={() => navigate('/residential/house_type/')}
                    >Back</Button>
                </Box>
            </Grid>

            <Grid
                item
                container
                md={6}
                xs={12}
                bgcolor="tertiary.main"
                direction="column"
                padding={4}
            >
                <Typography
                    variant="h4"
                    color="primary.main"
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

                <Grid container alignItems="center" marginTop="auto">
                    <Grid sx={{
                        display: { xs: "block", md: "none" },
                        width: "25%"
                    }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                marginTop: 4,
                                marginRight: 2,
                                width: "100%",
                                height: "50px",
                            }}
                            onClick={() => navigate('/residential/house_type/')}
                        >Back</Button>
                    </Grid>
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
                            onClick={() => navigate('/residential/appliances/', {
                                state: {
                                    oat,
                                    resType,
                                    floorArea
                                }
                            })}
                            disabled={nextDisabled}
                        >Next</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
