import React, { useState } from "react";
import {
  Button,
  ButtonGroup,
  Grid,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  createTheme,
  ThemeProvider,
  TextField,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createCaseIDs, gtaCalculation } from "../logic/DR_Calculations.js";
import { abbreviationToFullName } from "../logic/stateAbbreviations.js";
import { createVisualizations } from "./calculator-components/Visualizations.js";

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
  const [buildingType, setBuildingType] = useState();
  const [floorArea, setFloorArea] = useState();
  const [state, setState] = useState();
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

  const inputFloorArea = (event) => {
    setFloorArea(event.target.value);
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

  const checkIsValid = () => {
    //Function just checking for completeness for now. Will add range checks later.
    let inputValidity = "valid";
    
    //validate CSSB
    let CSSB_IsValid = true;
    for (var hour = 0; hour < 4; hour++) {
      if (
        !CSSB[hour].hasOwnProperty("avg_temp") ||
        !CSSB[hour].hasOwnProperty("avg_demand") ||
        !CSSB[hour].avg_temp ||
        !CSSB[hour].avg_demand
      ) {
        CSSB_IsValid = false;
      }
    }

    if (!buildingType || !floorArea || !peakDemand || !state || !precool || !tempReset || !CSSB_IsValid) {
      inputValidity = "missing input";
    }

    return (inputValidity);
  }

  const submitInputs = async () => {
    let inputValidity = checkIsValid()
    if (inputValidity == "valid") { //If inputs are valid
      setGraphs([]);
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

      //Display the graphs
      let outputDisplay = "";
      let kW_Shed = [];
      let W_ft2 = [];
      let shedPercentage = [];

      let kW_sum = 0;
      let shedPercentageSum = 0;

      for (var hour = 1; hour <= 4; hour++) {
        let hourkW = DR_output[hour - 1].DR_KW;
        kW_sum += hourkW;
        kW_Shed.push(hourkW);

        let hourW_ft2 = (1000 * hourkW) / floorArea;
        W_ft2.push(hourW_ft2);

        let hourShedPercentage = DR_output[hour - 1].DR_PCT * 100;
        shedPercentage.push(hourShedPercentage);
        shedPercentageSum += hourShedPercentage;
      }

      //add average values to data
      let avg_kW_Shed = kW_sum / 4;
      kW_Shed.push(avg_kW_Shed);

      let avg_W_ft2 = (1000 * avg_kW_Shed) / floorArea;
      W_ft2.push(avg_W_ft2);

      shedPercentage.push(shedPercentageSum / 4);

      //kW shed per hour
      setGraphs((prev) => [
        ...prev,
        createVisualizations(
          [1, 2, 3, 4, "Average"],
          "Estimated Kilowatt Shed per Hour",
          "Power (kW)",
          kW_Shed,
          graphs.length
        ),
      ]);

      //Watt shed per sq. ft. per hour
      setGraphs((prev) => [
        ...prev,
        createVisualizations(
          [1, 2, 3, 4, "Average"],
          "Estimated Watt Shed per Square Foot per Hour",
          "Power (Watts)",
          W_ft2,
          graphs.length
        ),
      ]);

      //kW percent shed per hour
      setGraphs((prev) => [
        ...prev,
        createVisualizations(
          [1, 2, 3, 4, "Average"],
          "Estimated Kilowatt Percent Shed per Hour",
          "Percentage Shed",
          shedPercentage,
          graphs.length
        ),
      ]);
    } else if (inputValidity == "missing input"){ //Inputs are incomplete
      alert("Please enter all the required inputs.") 
    }
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
                  onChange={inputFloorArea}
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
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
