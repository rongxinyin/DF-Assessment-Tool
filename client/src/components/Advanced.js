import * as React from "react";
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

export default function Advanced() {
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
