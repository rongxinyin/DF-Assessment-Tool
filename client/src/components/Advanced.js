import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import * as React from "react";
import TextField from "@mui/material/TextField";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Container, Typography } from "@mui/material";
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

  const textFieldInputPropsSX = {
    sx: {
      color: "tertiary.main",
    },
  };

  const textFieldSX = {
    width: "100%",
    marginBottom: 1,
    border: "0.05px solid #BED7DD",
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
          <Button>Basic</Button>
          <Button>Advanced</Button>
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
            color="tertiary.main"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            Basic Inputs
          </Typography>

          <Typography
            variant="body2"
            color="tertiary.main"
            sx={{ fontWeight: "bold", marginLeft: 1 }}
          >
            Building Name
          </Typography>
          <TextField
            id="outlined-basic"
            variant={textFieldVariant}
            autoComplete="off"
            color="secondary"
            sx={textFieldSX}
            inputProps={textFieldInputPropsSX}
          />
          <FormControl sx={{ width: "100%", marginBottom: 1 }}>
            <Typography
              variant="body2"
              color="tertiary.main"
              sx={{ fontWeight: "bold", marginLeft: 1 }}
            >
              Building Type
            </Typography>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={buildingType}
              color="secondary"
              onChange={chooseBuildingType}
            >
              <MenuItem value={"Office"}>Office</MenuItem>
              <MenuItem value={"Retail"}>Retail</MenuItem>
              <MenuItem value={"School"}>School</MenuItem>
            </Select>
          </FormControl>

          <Typography
            variant="body2"
            color="tertiary.main"
            sx={{ fontWeight: "bold", marginLeft: 1 }}
          >
            Floor Area (ft²)
          </Typography>
          <TextField
            id="outlined-basic"
            variant={textFieldVariant}
            autoComplete="off"
            type="number"
            color="secondary"
            sx={textFieldSX}
            inputProps={textFieldInputPropsSX}
          />

          <Typography
            variant="body2"
            color="tertiary.main"
            sx={{ fontWeight: "bold", marginLeft: 1 }}
          >
            Floor Height (ft²)
          </Typography>
          <TextField
            id="outlined-basic"
            variant={textFieldVariant}
            autoComplete="off"
            type="number"
            color="secondary"
            sx={textFieldSX}
            inputProps={textFieldInputPropsSX}
          />

          <FormControl sx={{ width: "100%", marginBottom: 1 }}>
            <Typography
              variant="body2"
              color="tertiary.main"
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
            >
              <MenuItem value={"Package RTU"}>Package RTU</MenuItem>
              <MenuItem value={"Package RTU + VAC"}>Package RTU + VAC</MenuItem>
              <MenuItem value={"Chiller + VAC"}>Chiller + VAC</MenuItem>
            </Select>
          </FormControl>

          <TextField
            id="outlined-basic"
            label="Summer Peak Demand (kW)"
            variant={textFieldVariant}
            autoComplete="off"
            type="number"
            color="secondary"
            sx={textFieldSX}
            inputProps={textFieldInputPropsSX}
          />

          <TextField
            id="outlined-basic"
            label="Zipcode"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
            sx={textFieldSX}
            inputProps={textFieldInputPropsSX}
          />

          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id="demo-simple-select-label" color="secondary">
              State
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={state}
              label="State"
              onChange={chooseState}
              color="secondary"
            >
              <MenuItem value={"CA"}>California</MenuItem>
              <MenuItem value={"MA"}>Massachusetts</MenuItem>
              <MenuItem value={"NY"}>New York</MenuItem>
              <MenuItem value={"TX"}>Texas</MenuItem>
            </Select>
          </FormControl>

          <Typography
            variant="h6"
            color="#BED7DD"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            Advanced HVAC Inputs
          </Typography>
          <TextField
            id="outlined-basic"
            label="Name"
            variant={textFieldVariant}
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Supply Air Flow (CFM)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Supply Fan Motor (hp)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Sensible Cooling Capacity (tons)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Total Cooling Capacity (tons)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Minimum OA Flow (CFM)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Fan Efficiency (%)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Motor Efficiency (%)"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <TextField
            id="outlined-basic"
            label="Package AC Unit Efficiency"
            variant={textFieldVariant}
            type="number"
            autoComplete="off"
            color="secondary"
          />

          <Typography
            variant="h6"
            color="#BED7DD"
            sx={{ fontWeight: "bold", m: 1 }}
          >
            Static Inputs
          </Typography>
        </form>
      </Grid>
      <Grid
        item md={7} xs={12}
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        bgcolor="tertiary.main"
        width={1}
      >
      </Grid>
    </Grid>

  );
}
