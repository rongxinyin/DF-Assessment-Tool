import * as React from "react";
import { useState } from "react";
import {
  Button,
  Box,
  styled,
  TextField,
  ButtonGroup,
  Container,
  Typography,
  Paper,
  Grid,
  Select,
  SelectChangeEvent,
  InputLabel,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

// visualization for boxes. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

let RTU_key = 0;

export default function TestAdvanced() {
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
      color: "tertiary.main",
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

  const RTU_inputs = [
    "Supply Air Flow (CFM)",
    "Supply Fan Motor (HP)",
    "Sensible Cooling Capacity (Tons)",
    "Total Cooling Capacity (Tons)",
    "Minimum OA Flow (CFM)",
    "Fan Efficiency (%)",
    "Motor Efficiency (%)",
    "Packaged AC Unit Efficiency",
  ];

  const handle_RTU_Inputs = (event, RTU_num, inputNum) => {
    let tempRTU_data = RTU_data;
    tempRTU_data[RTU_num][inputNum] = event.target.value;
    setRTU_Data(tempRTU_data);
  }

  const newRTU = () => {
    RTU_key += 1;
    setRTU_Data((RTU_data) => [...RTU_data, ["", "", "", "", "", "", "", "", RTU_key]]);
  }

  const removeRTU = (index) => {
    let tempRTU_data = [...RTU_data];
    tempRTU_data.splice(index, 1);
    setRTU_Data(tempRTU_data);
  }


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
    <Grid container spacing={0}>
      <Grid
        item
        md={5}
        xs={12}
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        bgcolor="primary.main"
        width={1}
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
          color="tertiary.main"
          sx={{ fontWeight: "bold", m: 1 }}
        >
          Advanced Calculator
        </Typography>

        <form>
          <Typography
            variant="h6"
            color="#BED7DD"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            Advanced HVAC Inputs
          </Typography>

          {/* RTU Inputs */}

          {RTU_data.map((rtu, rtu_index) => {
            return (
            <div key = {rtu[8]} style={{backgroundColor: "#bed7dd", width: "90%", marginLeft: "5%", marginTop: "10px", padding: "6px", borderRadius: "6px"}}>
                {rtu_index > 0 ? <Button onClick={() => removeRTU(rtu_index)} style={{maxWidth: '25px', maxHeight: '25px', minWidth: '25px', minHeight: '25px', float: "right", borderRadius: "100%", fontSize: "15px", backgroundColor: "#007681", border: "none", color: "white", margin: "5px", boxShadow: "1px 1px 4px #fff"}}>x</Button>: ""}
                <div style={{marginLeft: "6px", marginTop: "12px"}}>
                    <span style={{backgroundColor: "#007681", color: "white", padding: "5px", borderRadius: "8px"}}>RTU {rtu_index+1} </span>
                </div>
                <div style={{marginTop: "8px"}}>
                    {RTU_inputs.map((input, i) => {
                    return <TextField key = {i} onChange={(e) => handle_RTU_Inputs(e, rtu_index, i)} id="standard-basic" label={input} variant="outlined" style={{margin: "8px"}} size = "small" color = "secondary"/>
                    })}
                </div>
            </div>
            )})}

            <Button onClick={newRTU} style={{maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px', float: "right", borderRadius: "100%", fontSize: "24px", backgroundColor: "#007681", border: "none", color: "white", marginRight: "5px", boxShadow: "1px 1px 4px #fff"}}>+</Button>

          <Typography
            variant="h6"
            color="white.main"
            sx={{ fontWeight: "bold", m: 1 }}
            style={{marginTop: "50px"}}
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
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body6"
              color="white.main"
              sx={staticInputTypograhyStyle}
            >
              Air system Return Air (%)
            </Typography>
            <TextField
              style={{ marginRight: "5px" }}
              variant="outlined"
              type="number"
              sx={textFieldSX}
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
            />
          </div>
        </form>
      </Grid>
      <Grid
        item
        md={7}
        xs={12}
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        bgcolor="tertiary.main"
        width={1}
      ></Grid>
    </Grid>
  );
}
