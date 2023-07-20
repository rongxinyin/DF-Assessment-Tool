import React, { useEffect, useState } from "react";
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
import { createCaseIDs, gtaCalculation } from "../logic/DR_Calculations.js";
import { abbreviationToFullName } from "../logic/stateAbbreviations.js";
import {createVisualizations} from "./calculator-components/Visualizations.js";

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
  const [buildingType, setBuildingType] = useState("");
  const [state, setState] = useState("");
  const [hvacType, setHVACType] = useState("");
  const [CSSB, setCSSB] = useState([{}, {}, {}, {}]);
  const [precool, setPrecool] = useState();
  const [tempReset, setTempReset] = useState();
  const [peakDemand, setPeakDemand] = useState();

  const [graphs, setGraphs] = useState([]);

  const chooseBuildingType = (event) => {
    setBuildingType(event.target.value);
  };

  const chooseState = (event) => {
    setState(event.target.value);
  };

  const chooseHVACType = (event) => {
    setHVACType(event.target.value);
  };

  const inputPrecool = (event) => {
    setPrecool(event.target.value);
  };

  const inputTempReset = (event) => {
    setTempReset(event.target.value);
  };

  const inputPeakDemand = (event) => {
    setPeakDemand(event.target.value);
  };

  const inputCSSBData = (inputInfo, event) => {
    let CSSB_Type = inputInfo[0];
    let eventHour = inputInfo[1] - 1;

    let CSSB_Data = Number(event.target.value);

    let newCSSB = CSSB;
    let CSSB_Obj = newCSSB[eventHour];

    if (CSSB_Type == "OAT") {
      CSSB_Obj["avg_temp"] = CSSB_Data;
    } else {
      CSSB_Obj["avg_demand"] = CSSB_Data;
    }

    newCSSB[eventHour] = CSSB_Obj;
    setCSSB(newCSSB);
  };

  const submitInputs = async () => {
    //Validate inputs, make sure everything is entered

    //Generate caseID
    let buildingTypeSize = "";
    if (buildingType == "Office") {
      if (peakDemand < 200) {
        buildingTypeSize = "SmallOffice";
      } else if (peakDemand < 500) {
        buildingTypeSize = "MediumOffice";
      } else {
        buildingTypeSize = "LargeOffice";
      }
    } else {
      buildingTypeSize = buildingType;
    }
    let caseIDs = createCaseIDs(
      state,
      buildingTypeSize,
      2004,
      precool,
      tempReset
    );

    let fullStateName = abbreviationToFullName(state);

    //GTA calculations
    let DR_output = await gtaCalculation(fullStateName, caseIDs, CSSB);
    console.log(DR_output);

    //Display the output
    let outputDisplay = "";
    let kW_Shed = [];

    let kW_sum = 0;

    for (var hour = 1; hour <= 4; hour++) {
      let hourkW = DR_output[hour - 1].DR_KW;
      kW_sum += hourkW;
      kW_Shed.push(hourkW);
      outputDisplay +=
        "Hour: " +
        hour +
        ", Estimated DR %: " +
        DR_output[hour - 1].DR_PCT * 100 +
        ", Estimated kW Shed: " +
        hourkW +
        "<br/>";
    }
    document.getElementById("testingDR_Output").innerHTML = outputDisplay;

    kW_Shed.push(kW_sum / 4);
    setGraphs(graphs.concat(createVisualizations(
      [1, 2, 3, 4, "Average"],
      "Estimated kW Shed per Hour:",
      kW_Shed
    )));
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
                  onChange={inputPeakDemand}
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
                    <MenuItem value={"MA"}>Massachusetts</MenuItem>
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
                onChange={inputPrecool}
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
                onChange={inputTempReset}
                type="number"
                sx={textFieldSX}
                inputProps={textFieldInputPropsSX}
              />

              <Box sx={{ flexDirection: "row" }}>
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
                  OAT (°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  onChange={(event) => inputCSSBData(["OAT", 1], event)}
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
                  onChange={(event) => inputCSSBData(["Demand", 1], event)}
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
                  OAT (°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  onChange={(event) => inputCSSBData(["OAT", 2], event)}
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
                  onChange={(event) => inputCSSBData(["Demand", 2], event)}
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
                  OAT (°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  onChange={(event) => inputCSSBData(["OAT", 3], event)}
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
                  onChange={(event) => inputCSSBData(["Demand", 3], event)}
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
                  OAT (°F)
                </Typography>

                <TextField
                  type="number"
                  id="outlined-basic"
                  variant={textFieldVariant}
                  autoComplete="off"
                  onChange={(event) => inputCSSBData(["OAT", 4], event)}
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
                  onChange={(event) => inputCSSBData(["Demand", 4], event)}
                  sx={textFieldSX}
                  inputProps={textFieldInputPropsSX}
                />
                <br></br>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={submitInputs}
                  sx={{
                    marginTop: 2,
                    marginBottom: 3,
                    width: "25%",
                    height: "50px",
                  }}
                >
                  Calculate
                </Button>
              </Box>
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
            {graphs}
            <Typography
              variant="h5"
              color="primary.main"
              sx={{ fontWeight: "bold", m: 1 }}
            >
              Estimated kW Shed during the DR Event Hours
            </Typography>
            <Typography id="testingCaseIDs"> </Typography>
            <Typography id="testingDR_Output"></Typography>
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
