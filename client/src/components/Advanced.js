import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import * as React from "react";
import TextField from "@mui/material/TextField";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Container } from "@mui/material";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

// visualization for boxes. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function Advanced() {
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

  return (
    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
      <Box gridColumn="span 5" bgcolor="primary.main">
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled elevation buttons"
          color="secondary"
        >
          <Button>Basic</Button>
          <Button>Advanced</Button>
        </ButtonGroup>

        <h1>Advanced Calculator</h1>

        <p>Building Name</p>
        <TextField
          id="outlined-basic"
          label="Building Name"
          variant={textFieldVariant}
          autoComplete="off"
        />

        <p>Building Type</p>
        <FormControl sx={{ m: 1, minWidth: 200 }}>
          <InputLabel id="demo-simple-select-label">Building Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={buildingType}
            label="Building Type"
            onChange={chooseBuildingType}
          >
            <MenuItem value={"Office"}>Office</MenuItem>
            <MenuItem value={"Retail"}>Retail</MenuItem>
            <MenuItem value={"School"}>School</MenuItem>
          </Select>
        </FormControl>

        <p>Floor Area</p>
        <TextField
          id="outlined-basic"
          label="Floor Area"
          variant={textFieldVariant}
          autoComplete="off"
        />

        <p>HVAC Type</p>
        <FormControl sx={{ m: 1, minWidth: 200 }}>
          <InputLabel id="demo-simple-select-label">HVAC Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={hvacType}
            label="HVAC Type"
            onChange={chooseHVACType}
          >
            <MenuItem value={"Package RTU"}>Package RTU</MenuItem>
            <MenuItem value={"Package RTU + VAC"}>Package RTU + VAC</MenuItem>
            <MenuItem value={"Chiller + VAC"}>Chiller + VAC</MenuItem>
          </Select>
        </FormControl>

        <p>Summer Peak Demand</p>
        <TextField
          id="outlined-basic"
          label="Summer Peak Demand"
          variant={textFieldVariant}
          autoComplete="off"
        />

        <p>Zipcode</p>
        <TextField
          id="outlined-basic"
          label="Zipcode"
          variant={textFieldVariant}
          type="number"
          autoComplete="off"
        />

        <p>State</p>
        <FormControl sx={{ m: 1, minWidth: 200 }}>
          <InputLabel id="demo-simple-select-label">State</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={state}
            label="State"
            onChange={chooseState}
          >
            <MenuItem value={"CA"}>California</MenuItem>
            <MenuItem value={"MA"}>Massachusetts</MenuItem>
            <MenuItem value={"NY"}>New York</MenuItem>
            <MenuItem value={"TX"}>Texas</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box gridColumn="span 7">
        <Item>xs=4</Item>
      </Box>
      <Box gridColumn="span 4">
        <Item>xs=4</Item>
      </Box>
    </Box>
  );
}
