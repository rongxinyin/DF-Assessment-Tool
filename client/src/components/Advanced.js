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
} from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@mui/material';


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
    border: "2px solid #F0F0F0",
    backgroundColor: "secondary.main",
    borderRadius: "10px",
  };

  const [data, setData] = useState([
    ['RTU-1', '', '', '', '', '', '', '', ''], // Row 1: Initialize with empty strings
    ['RTU-2', '', '', '', '', '', '', '', ''], // Row 2: Initialize with empty strings
  ]);

  const [showSecondRow, setShowSecondRow] = useState(false);


  const handleInputChange = (rowIndex, columnIndex, event) => {
    const newData = [...data];
    newData[rowIndex][columnIndex] = event.target.value;
    setData(newData);
  };

  const handleCheckboxChange = (event) => {
    const newShowSecondRow = event.target.checked;
    setShowSecondRow(newShowSecondRow);

    if (!newShowSecondRow) {
      // Clear inputs in the second row if the checkbox is unchecked
      const newData = [...data];
      for (let i = 1; i < newData[1].length; i++) {
        newData[1][i] = '';
      }
      setData(newData);
    }

  };

  const tableCellStyle = {
    borderCollapse: 'collapse',
    border: "none",
    color: "white.main",
    width: 100,
  };




  return (
    <Grid container spacing={0} >
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
          <div >
            <Box sx={{ overflow: "auto" }}>
              <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                <TableContainer component={Paper} sx={{ backgroundColor: "secondary.main" }} >
                  <Table sx={{ borderCollapse: 'collapse', border: "none" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableCellStyle}>HVAC Device</TableCell>
                        <TableCell sx={tableCellStyle}>Supply Air Flow (CFM)</TableCell>
                        <TableCell sx={tableCellStyle}>Supply Fan Motor (HP)</TableCell>
                        <TableCell sx={tableCellStyle}>Sensible Cooling Capacity (Tons)</TableCell>
                        <TableCell sx={tableCellStyle}>Total Cooling Capacity (Tons)</TableCell>
                        <TableCell sx={tableCellStyle}>Minimum OA Flow (CFM)</TableCell>
                        <TableCell sx={tableCellStyle}>Fan Efficiency (%)</TableCell>
                        <TableCell sx={tableCellStyle}>Motor Efficiency (%)</TableCell>
                        <TableCell sx={tableCellStyle}>Packaged AC Unit Efficiency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                          <TableRow>
                            {row.map((cell, columnIndex) => (
                              <TableCell sx={tableCellStyle} key={columnIndex}>
                                {columnIndex === 0 ? (
                                  <strong>{cell}</strong>
                                ) : (
                                  <TextField
                                    variant="outlined"
                                    value={cell}
                                    type="number"
                                    sx={textFieldSX}
                                    onChange={(event) => handleInputChange(rowIndex, columnIndex, event)}
                                    disabled={rowIndex === 1 && !showSecondRow}
                                  />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                          {rowIndex === 0 && (
                            <TableRow>
                              <TableCell sx={tableCellStyle}>
                                <Checkbox checked={showSecondRow} onChange={handleCheckboxChange} />
                              </TableCell>
                              <TableCell sx={tableCellStyle} colSpan={4}>Add 2nd HVAC Device</TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>



          </div>


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
