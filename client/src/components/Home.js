import * as React from "react";
import {
  Button,
  ButtonGroup,
  Grid,
  Container,
  Typography,
  Paper,
  Select,
  SelectChangeEvent,
  InputLabel,
  MenuItem,
  FormControl,
  createTheme,
  ThemeProvider,
  TextField,
  createTypography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      // darker blue
      main: "#00303C",
    },
    secondary: {
      // medium blue
      main: "#007681",
    },
    white: {
      main: "#FFFFFF",
    },
  },

  typography: {
    primary: {
      // white
      main: "#FFFFFF",
    },
    secondary: {
      // medium blue
      main: "#007681",
    },
  },
});

export default function Home() {
  let navigate = useNavigate(); // navigate to diff pages
  // dropdown forms
  const [buildingType, setBuildingType] = React.useState("");
  const [state, setState] = React.useState("");
  const [hvacType, setHVACType] = React.useState("");

  const chooseBuildingType = (event) => {
    setBuildingType(event.target.value);
  };

  const chooseState = (event) => {
    setState(event.target.value);
  };

  const chooseHVACType = (event) => {
    setHVACType(event.target.value);
  };

  const textFieldVariant = "outlined";

  const textFieldInputPropsSX = {
    sx: {
      color: "#FFFFFF",
    },
  };

  const textFieldSX = {
    width: "50%",
    marginBottom: 1,
    marginTop: 1,
    border: "2px solid #F0F0F0",
    backgroundColor: "secondary.main",
    borderRadius: "10px",
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Grid container spacing={4} width="100%" height="100%">
          <Grid
            item
            md={5}
            xs={12}
            container
            direction="column"
            alignItems="left"
            justifyContent="center"
            bgcolor="primary.main"
            width={1}
            sx={{ overflow: "scroll" }}
          >
            <ButtonGroup
              disableElevation
              variant="contained"
              aria-label="Disabled elevation buttons"
              color="secondary"
              sx={{ marginTop: 2 }}
            >
              <Button onClick={() => navigate("/basic")}>Basic</Button>
              <Button onClick={() => navigate("/advanced")}>Advanced</Button>
            </ButtonGroup>

            <Typography
              variant="h4"
              color="white.main"
              sx={{ fontWeight: "bold", m: 1, marginTop: 2 }}
            >
              Basic Calculator
            </Typography>

            <form>
              <Typography
                variant="h6"
                color="white.main"
                sx={{ fontWeight: "bold", m: 1 }}
              >
                Basic Inputs
              </Typography>
              <div /*style={{width:'50%'}}*/>
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Building Name
                </Typography>
                <TextField
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <FormControl sx={{ width: "75%", marginBottom: 1 }}>
                  <Typography
                    variant="body2"
                    color="white.main"
                    sx={{ fontWeight: "bold", marginLeft: 1 }}
                  >
                    Building Type
                  </Typography>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={buildingType}
                    onChange={chooseBuildingType}
                    sx={textFieldSX}
                  >
                    <MenuItem value={"Office"}>Office</MenuItem>
                    <MenuItem value={"Retail"}>Retail</MenuItem>
                    <MenuItem value={"School"}>School</MenuItem>
                  </Select>
                </FormControl>

                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Floor Area (ft²)
                </Typography>
                <TextField
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  type="number"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />

                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Floor Height (ft²)
                </Typography>
                <TextField
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  type="number"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />

                <FormControl sx={{ width: "75%", marginBottom: 1 }}>
                  <Typography
                    variant="body2"
                    color="white.main"
                    sx={{ fontWeight: "bold", marginLeft: 1 }}
                  >
                    HVAC Type
                  </Typography>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={hvacType}
                    onChange={chooseHVACType}
                    color="secondary"
                    sx={textFieldSX}
                  >
                    <MenuItem value={"Package RTU"}>Package RTU</MenuItem>
                    <MenuItem value={"Package RTU + VAC"}>
                      Package RTU + VAC
                    </MenuItem>
                    <MenuItem value={"Chiller + VAC"}>Chiller + VAC</MenuItem>
                  </Select>
                </FormControl>

                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Summer Peak Demand (kW)
                </Typography>

                <TextField
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  type="number"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />

                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Zipcode
                </Typography>
                <TextField
                  id="outlined-basic"
                  variant={textFieldVariant}
                  type="number"
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  State
                </Typography>
                <FormControl sx={{ width: "50%" }}>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={state}
                    onChange={chooseState}
                    color="secondary"
                    sx={textFieldSX}
                  >
                    <MenuItem value={"CA"}>California</MenuItem>
                    <MenuItem value={"MD"}>Maryland</MenuItem>
                    <MenuItem value={"NY"}>New York</MenuItem>
                    <MenuItem value={"TX"}>Texas</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <Typography
                variant="h6"
                color="white.main"
                sx={{ fontWeight: "bold", m: 1 }}
              >
                HVAC Temp DR Shed Capacity Calculation
              </Typography>

              <Typography
                variant="body2"
                color="white.main"
                sx={{ fontWeight: "bold", marginLeft: 1 }}
              >
                Percentage of Bldg Floor Area that GTA will Apply (0-100)
              </Typography>
              <TextField
                id="outlined-basic"
                variant={textFieldVariant}
                autoComplete="off"
                type="number"
                sx={textFieldSX}
                inputProps={textFieldInputPropsSX}
              />

              <Typography
                variant="body2"
                color="white.main"
                sx={{ fontWeight: "bold", marginLeft: 1 }}
              >
                Precool Period Temp Offset (°F)
              </Typography>
              <TextField
                id="outlined-basic"
                variant={textFieldVariant}
                autoComplete="off"
                sx={textFieldSX}
                inputProps={textFieldInputPropsSX}
                type="number"
              />

              <Typography
                variant="body2"
                color="white.main"
                sx={{ fontWeight: "bold", marginLeft: 1 }}
              >
                DR Event Period Temp Offset (°F)
              </Typography>
              <TextField
                id="outlined-basic"
                variant={textFieldVariant}
                autoComplete="off"
                type="number"
                sx={textFieldSX}
                inputProps={textFieldInputPropsSX}
              />

              <box sx={{ flexDirection: "row" }}>
                <Typography
                  variant="h6"
                  color="white.main"
                  sx={{ fontWeight: "bold", m: 1 }}
                >
                  OAT and kW During the DR Event Hours
                </Typography>

                <Typography
                  variant="h5"
                  color="white.main"
                  sx={{ fontWeight: "bold", m: 1 }}
                >
                  Hour 1
                </Typography>
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  OAT(°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Meter kW
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <Typography
                  variant="h5"
                  color="white.main"
                  sx={{ fontWeight: "bold", m: 1 }}
                >
                  Hour 2
                </Typography>
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  OAT(°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Meter kW
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />

                <Typography
                  variant="h5"
                  color="white.main"
                  sx={{ fontWeight: "bold", m: 1 }}
                >
                  Hour 3
                </Typography>

                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  OAT(°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />

                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Meter kW
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <Typography
                  variant="h5"
                  color="white.main"
                  sx={{ fontWeight: "bold", m: 1 }}
                >
                  Hour 4
                </Typography>
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  OAT(°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <Typography
                  variant="body2"
                  color="white.main"
                  sx={{ fontWeight: "bold", marginLeft: 1 }}
                >
                  Meter kW
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <br></br>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    marginTop: 2,
                    marginBottom: 3,
                    width: "25%",
                    height: "50px",
                  }}
                >
                  Calculate
                </Button>
              </box>
            </form>
          </Grid>
          <Grid
            item
            md={7}
            xs={12}
            container
            direction="column"
            alignItems="center"
            justifyContent="flex-start"
            bgcolor="#BED7DD"
            width={1}
            sx={{ overflow: "scroll" }}
          >
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ fontWeight: "bold", m: 1, marginTop: 2 }}
            >
              Visualizations
            </Typography>

            <Typography
              variant="h5"
              color="primary.main"
              sx={{ fontWeight: "bold", m: 1 }}
            >
              HVAC Temp Reset DR Shed Estimates (kW) for Different Peak Temps in
              Building's Climate Zone
            </Typography>
            <Box
              sx={{
                width: 500,
                height: 300,
                backgroundColor: "white.main",
                "&:hover": {
                  backgroundColor: "white.main",
                  opacity: [0.9, 0.8, 0.7],
                },
                marginTop: 3,
                marginBottom: 3,
              }}
            />
            <Typography
              variant="h5"
              color="primary.main"
              sx={{ fontWeight: "bold", m: 1 }}
            >
              Estimated kW Shed during the DR Event Hours
            </Typography>
            <Box
              sx={{
                width: 500,
                height: 300,
                backgroundColor: "white.main",
                "&:hover": {
                  backgroundColor: "white.main",
                  opacity: [0.9, 0.8, 0.7],
                },
                marginTop: 3,
                marginBottom: 3,
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
