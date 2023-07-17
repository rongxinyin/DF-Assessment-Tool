import Button from "@mui/material/Button";
import * as React from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { createTheme, ThemeProvider } from "@mui/material";
import TextField from "@mui/material/TextField";
import createTypography from "@mui/material/styles/createTypography";

const theme = createTheme({
  palette: {
    primary: {
      // darker blue
      main: '#00303C',
    },
    secondary: {
      // medium blue
      main: '#007681',
    },
    white: {
      main:'#FFFFFF',
    }
  },

  typography: {
    primary: {
      // white
      main: '#FFFFFF',
    },
    secondary: {
      // medium blue
      main: '#007681',
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
      color: "tertiary.main",
    },
  };

  const textFieldSX = {
    width: "100%",
    marginBottom: 1,
    border: "0.05px solid #BED7DD",
  };

  return (
    <ThemeProvider theme={theme}>
    <Container maxWidth="xl">

  <Grid container spacing={4}>
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
        sx={{ fontWeight: "bold", m: 1 }}
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
          color="secondary"
          sx={textFieldSX}
          inputProps={textFieldInputPropsSX}
        />
        <FormControl sx={{ width: "50%", marginBottom: 1 }}>
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
          color="secondary"
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
          color="secondary"
          sx={textFieldSX}
          inputProps={textFieldInputPropsSX}
        />

        <FormControl sx={{ width: "50%", marginBottom: 1 }}>
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
              <MenuItem value={"AL"}>Alabama</MenuItem>
              <MenuItem value={"AK"}>Alaska</MenuItem>
              <MenuItem value={"AZ"}>Arizona</MenuItem>
              <MenuItem value={"AR"}>Arkansas</MenuItem>
              <MenuItem value={"CA"}>California</MenuItem>
              <MenuItem value={"CO"}>Colorado</MenuItem>
              <MenuItem value={"CT"}>Connecticut</MenuItem>
              <MenuItem value={"DE"}>Delaware</MenuItem>
              <MenuItem value={"FL"}>Florida</MenuItem>
              <MenuItem value={"GA"}>Georgia</MenuItem>
              <MenuItem value={"HI"}>Hawaii</MenuItem>
              <MenuItem value={"ID"}>Idaho</MenuItem>
              <MenuItem value={"IL"}>Illinois</MenuItem>
              <MenuItem value={"IN"}>Indiana</MenuItem>
              <MenuItem value={"IA"}>Iowa</MenuItem>
              <MenuItem value={"KS"}>Kansas</MenuItem>
              <MenuItem value={"KY"}>Kentucky</MenuItem>
              <MenuItem value={"LA"}>Louisiana</MenuItem>
              <MenuItem value={"ME"}>Maine</MenuItem>
              <MenuItem value={"MD"}>Maryland</MenuItem>
              <MenuItem value={"MA"}>Massachusetts</MenuItem>
              <MenuItem value={"MI"}>Michigan</MenuItem>
              <MenuItem value={"MN"}>Minnesota</MenuItem>
              <MenuItem value={"MS"}>Mississippi</MenuItem>
              <MenuItem value={"MO"}>Missouri</MenuItem>
              <MenuItem value={"MT"}>Montana</MenuItem>
              <MenuItem value={"NE"}>Nebraska</MenuItem>
              <MenuItem value={"NV"}>Nevada</MenuItem>
              <MenuItem value={"NH"}>New Hampshire</MenuItem>
              <MenuItem value={"NJ"}>New Jersey</MenuItem>
              <MenuItem value={"NM"}>New Mexico</MenuItem>
              <MenuItem value={"NY"}>New York</MenuItem>
              <MenuItem value={"NC"}>North Carolina</MenuItem>
              <MenuItem value={"ND"}>NOrth Dakota</MenuItem>
              <MenuItem value={"OH"}>Ohio</MenuItem>
              <MenuItem value={"OK"}>Oklahoma</MenuItem>
              <MenuItem value={"OR"}>Oregon</MenuItem>
              <MenuItem value={"PA"}>Pennsylvania</MenuItem>
              <MenuItem value={"RI"}>Rhode Island</MenuItem>
              <MenuItem value={"SC"}>South Carolina</MenuItem>
              <MenuItem value={"SD"}>South Dakota</MenuItem>
              <MenuItem value={"TN"}>Tennessee</MenuItem>
              <MenuItem value={"TX"}>Texas</MenuItem>
              <MenuItem value={"UT"}>Utah</MenuItem>
              <MenuItem value={"VT"}>Vermont</MenuItem>
              <MenuItem value={"VA"}>Virginia</MenuItem>
              <MenuItem value={"WA"}>Washington</MenuItem>
              <MenuItem value={"WV"}>West Virginia</MenuItem>
              <MenuItem value={"WI"}>Wisconsin</MenuItem>
              <MenuItem value={"WY"}>Wyoming</MenuItem>
            </Select>
          </FormControl>      
          
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
          color="secondary"
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
          type="number"
          color="secondary"
          sx={textFieldSX}
          inputProps={textFieldInputPropsSX}
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
          color="secondary"
          sx={textFieldSX}
          inputProps={textFieldInputPropsSX}
        />

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
        bgcolor="#BED7DD"
        width={1}
      >
      
      </Grid>
    </Grid>
    </Container>
    </ThemeProvider>
  );

  }
