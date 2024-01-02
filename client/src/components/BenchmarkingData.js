import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import React, { useState, useEffect } from "react";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [createData("Frozen yoghurt", 159, 6.0, 24, 4.0)];

export default function BenchmarkingData() {
  return (
    <Box sx={{ margin: 3, marginTop: 5, flexGrow: 1 }}>
      <Typography variant="h4" sx={{}}>
        Site Info
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Site ID</TableCell>
              <TableCell align="right">DOE Climate Zone</TableCell>
              <TableCell align="right">City</TableCell>
              <TableCell align="right">State</TableCell>
              <TableCell align="right">Zip</TableCell>
              <TableCell align="right">Number of Floors</TableCell>
              <TableCell align="right">Total Building Area (ft²) </TableCell>
              <TableCell align="right">Net Selling Area (ft²)</TableCell>
              <TableCell align="right">Total Stock Area (ft²)</TableCell>
              <TableCell align="right">Number of HVAC</TableCell>
              <TableCell align="right">Program</TableCell>
              <TableCell align="right">Utility</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
