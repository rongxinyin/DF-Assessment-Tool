import {
  Button,
  ButtonGroup,
  Grid,
  Paper,
  TextField,
  Typography,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { calculations } from "../logic/AdvancedCalculations.js";
import { createVisualizations } from "./calculator-components/Visualizations.js";

// visualization for boxes. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

let RTU_key = 0;

const createTableData = (number, name, value) => {
  return { number, name, value };
};

export default function Advanced() {
  let navigate = useNavigate(); // navigate to diff pages
  // dropdown forms

  const textFieldVariant = "outlined";

  const textFieldInputPropsSX = {
    sx: {
      color: "common.white",
    },
  };

  const textFieldSX = {
    width: "100%",
    marginBottom: 1,
    border: "2px solid #F0F0F0",
    backgroundColor: "secondary.main",
    borderRadius: "10px",
  };

  const [RTU_data, setRTU_Data] = useState([
    ["", "", "", "", "", "", "", "", 0],
  ]);
  const [coolingCoilAirTemp, setCoolingCoilAirTemp] = useState();
  const [acLoadFactor, setAC_LoadFactor] = useState();
  const [minOSA, setMinOSA] = useState();
  const [returnAir, setReturnAir] = useState();
  const [totalStaticPressure, setTotalStaticPressure] = useState();
  const [resetStaticPressure, setResetStaticPressure] = useState();
  const [normalTempSetpoint, setNormalTempSetpoint] = useState();
  const [resetTempSetpoint, setResetTempSetpoint] = useState();
  const [calculationOutput, setCalculationOutput] = useState({});

  const [graphs, setGraphs] = useState([]);
  const [tableRows, setTableRows] = useState([]);

  const RTU_inputs = [
    "Supply Air Flow (CFM)",
    "Supply Fan Motor (HP)",
    "Sensible Cooling Capacity (Tons)",
    "Total Cooling Capacity (Tons)",
    "Minimum OA Flow (CFM)",
    "Fan Efficiency (%)",
    "Motor Efficiency (%)",
    "Packaged AC Unit Efficiency (kW/Ton)",
  ];

  const handle_RTU_Inputs = (event, RTU_num, inputNum) => {
    let tempRTU_data = RTU_data;
    if (inputNum == 5 || inputNum == 6) {
      // convert the fan and motor efficiency to decimal
      tempRTU_data[RTU_num][inputNum] = Number(event.target.value / 100);
    } else {
      tempRTU_data[RTU_num][inputNum] = Number(event.target.value);
    }
    setRTU_Data(tempRTU_data);
  };

  const newRTU = () => {
    RTU_key += 1;
    setRTU_Data((RTU_data) => [
      ...RTU_data,
      ["", "", "", "", "", "", "", "", RTU_key],
    ]);
  };

  const removeRTU = (index) => {
    let tempRTU_data = [...RTU_data];
    tempRTU_data.splice(index, 1);
    setRTU_Data(tempRTU_data);
  };

  const submitInputs = async () => {
    //Update analytics
    const res = await axios.patch(
      `http://localhost:8080/analytics/requestUpdate/advanced`
    );

    setGraphs([]);

    let output = calculations({
      rtu_input_array: RTU_data,
      normal_space_temp_setting: normalTempSetpoint,
      cooling_coil_leaving_air_temp: coolingCoilAirTemp,
      reset_space_temp_setting: resetTempSetpoint,
      total_static_SF_pressure: totalStaticPressure,
      reset_static_pressure_value: resetStaticPressure,
      air_system_minimum_osa: minOSA,
      ac_load_factor: acLoadFactor,
      size_of_conditioned_space: 140000,
      height_of_conditioned_space: 8,
      coast: 1,
    });
    setCalculationOutput(output);

    //Create graph with output data
    let graphData = [
      output.enthalpy_coast,
      output.chiller_direct_reduction,
      output.reduced_kW_from_CFM_reduction,
      output.reduced_kW_from_static_pressure_reset,
      output.total_DR_load_reduction,
    ];
    setGraphs((prev) => [
      ...prev,
      createVisualizations(
        [1, 2, 3, 4, "Total"],
        "Load Reduction Results",
        "Shed Components",
        "Power (kW)",
        graphData,
        graphs.length,
        300,
        ["#f5ca0a", "#f5ca0a", "#f5ca0a", "#f5ca0a", "#05a129"]
      ),
    ]);

    setTableRows([
      createTableData("1", "Enthalpy Coast", graphData[0]),
      createTableData("2", "Chiller Direct Reduction", graphData[1]),
      createTableData("3", "Reduced kW from CFM Reduction", graphData[2]),
      createTableData(
        "4",
        "Reduced kW from Static Pressure Reset",
        graphData[3]
      ),
      createTableData("5", "Total Load Reduction", graphData[4]),
    ]);
  };

  const tableCellStyle = {
    //borderCollapse: "collapse",
    border: "none",
    color: "white.main",
    //minWidth: "120px",
  };

  const staticInputTypograhyStyle = {
    m: 1,
    width: "300px",
  };

  return (
    <Grid container spacing={0} style={{ marginTop: "28px" }}>
      <Grid
        item
        md={6}
        xs={12}
        container
        direction="column"
        bgcolor="primary.main"
        width={1}
        padding={4}
      >
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled elevation buttons"
          color="secondary"
        >
          <Button onClick={() => navigate("/basic")}>Basic</Button>
          <Button onClick={() => navigate("/advanced")}>Advanced</Button>
        </ButtonGroup>

        <Typography
          variant="h4"
          color="white.main"
          sx={{ fontWeight: "bold", marginTop: "36px" }}
        >
          Advanced Calculator
        </Typography>

        <form>
          <Typography
            variant="h6"
            color="white.main"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            Advanced HVAC Inputs
          </Typography>

          {/* RTU Inputs */}

          {RTU_data.map((rtu, rtu_index) => {
            return (
              <div
                key={rtu[8]}
                style={{
                  backgroundColor: "#bed7dd",
                  width: "100%",
                  marginTop: "10px",
                  padding: "6px",
                  borderRadius: "6px",
                }}
              >
                {rtu_index > 0 ? (
                  <Button
                    onClick={() => removeRTU(rtu_index)}
                    style={{
                      maxWidth: "25px",
                      maxHeight: "25px",
                      minWidth: "25px",
                      minHeight: "25px",
                      float: "right",
                      borderRadius: "100%",
                      fontSize: "15px",
                      backgroundColor: "#007681",
                      border: "none",
                      color: "white",
                      margin: "5px",
                      boxShadow: "1px 1px 4px #fff",
                    }}
                  >
                    x
                  </Button>
                ) : (
                  ""
                )}
                <div style={{ marginLeft: "6px", marginTop: "12px" }}>
                  <span
                    style={{
                      backgroundColor: "#007681",
                      color: "white",
                      padding: "5px",
                      borderRadius: "8px",
                    }}
                  >
                    RTU {rtu_index + 1}{" "}
                  </span>
                </div>
                <div style={{ marginTop: "8px" }}>
                  {RTU_inputs.map((input, i) => {
                    return (
                      <TextField
                        key={i}
                        onChange={(e) => handle_RTU_Inputs(e, rtu_index, i)}
                        label={input}
                        variant="outlined"
                        style={{
                          marginLeft: "3%",
                          marginRight: "2%",
                          marginTop: "8px",
                          marginBottom: "6px",
                          minWidth: "45%",
                        }}
                        size="small"
                        color="secondary"
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          <Button
            onClick={newRTU}
            style={{
              maxWidth: "30px",
              maxHeight: "30px",
              minWidth: "30px",
              minHeight: "30px",
              float: "right",
              borderRadius: "100%",
              fontSize: "24px",
              backgroundColor: "#007681",
              border: "none",
              color: "white",
              marginTop: "5px",
              boxShadow: "1px 1px 4px #fff",
            }}
          >
            +
          </Button>

          <Typography
            variant="h6"
            color="white.main"
            sx={{ fontWeight: "bold", m: 1 }}
            style={{ marginTop: "50px" }}
          >
            Static Inputs
          </Typography>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Cooling Coil Leaving Air Temperature (°F)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setCoolingCoilAirTemp(Number(e.target.value))}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              type="number"
              sx={staticInputTypograhyStyle}
            >
              AC Load Factor (%)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setAC_LoadFactor(Number(e.target.value / 100))}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Air system minimum OSA (%)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setMinOSA(Number(e.target.value / 100))}
            />
          </div>

          <Typography
            variant="h6"
            color="white.main"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            Static Pressure Reset Inputs
          </Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Total SF Static Pressure in H2O (inches)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setTotalStaticPressure(Number(e.target.value))}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Reset Static Pressure Value in H2O (inches)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setResetStaticPressure(Number(e.target.value))}
            />
          </div>

          <Typography
            variant="h6"
            color="white.main"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            GTA Strategies Inputs
          </Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Normal Space Temperature Setpoint (°F)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setNormalTempSetpoint(Number(e.target.value))}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Reset Space Temperature Setpoint (°F)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
              inputProps={textFieldInputPropsSX}
              onChange={(e) => setResetTempSetpoint(Number(e.target.value))}
            />
          </div>
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
        </form>
      </Grid>
      <Grid
        item
        md={6}
        xs={12}
        container
        direction="column"
        alignItems="center"
        //justifyContent="center"
        bgcolor="tertiary.main"
        width={1}
      >
        <Typography
          variant="h4"
          color="primary.main"
          sx={{ fontWeight: "bold", m: 1 }}
          style={{ marginTop: "24px" }}
        >
          Reduction Results
        </Typography>

        {tableRows.length > 0 ? (
          <TableContainer component={Paper} style={{ width: "80%" }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell> </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontWeight: "bold", color: "#303030" }}
                  >
                    Shed Category
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold" }}>
                    {" "}
                    Shed Result (kW)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow
                    key={row.number}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center" component="th" scope="row">
                      {row.number}
                    </TableCell>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          ""
        )}

        {/* <Grid justifyContent="left" style={{ marginTop: "10px" }}>
          {Object.keys(calculationOutput).map((keyName, i) => (
            <div key={i}>
              <div
                style={{ float: "left", marginRight: "30px", marginTop: "5px" }}
              >
                {i + 1}. {keyName}:
              </div>
              <div style={{ float: "right", marginTop: "5px" }}>
                {calculationOutput[keyName].toFixed(2)}
              </div>
            </div>
          ))}
        </Grid> */}
        <Typography
          variant="h4"
          color="primary.main"
          sx={{ fontWeight: "bold", m: 1 }}
          style={{ marginTop: "36px" }}
        >
          Visualizations
        </Typography>
        {graphs}
      </Grid>
    </Grid>
  );
}
