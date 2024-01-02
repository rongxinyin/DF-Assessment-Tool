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
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [createData("Frozen yoghurt", 159, 6.0, 24, 4.0)];

export default function BenchmarkingData() {
  const siteID = useParams(); // get siteID from url
  const [siteData, setSiteData] = useState();

  const getSiteData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/benchmarking/${siteID.site_id}`
      );
      if (response.data) {
        console.log("Data received:", response.data);
        return response.data;
      } else {
        console.log("No data received, response:", response);
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  useEffect(() => {
    getSiteData().then((data) => {
      setSiteData(data);
    });
  }, []);

  console.log("site data: ", siteData);

  return (
    <Box sx={{ margin: 3, marginTop: 8, flexGrow: 1 }}>
      <Typography variant="h4" sx={{ marginBottom: 1 }}>
        Site Info
      </Typography>
      {siteData ? (
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
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {siteData.siteID}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].doe_climate_zone}
                </TableCell>
                <TableCell align="right">{siteData.siteInfo[0].city}</TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].state}
                </TableCell>
                <TableCell align="right">{siteData.siteInfo[0].zip}</TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].number_of_floor}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].total_building_area_ft2}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].net_selling_area_ft2}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].total_stock_area_ft2}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].number_of_HVAC}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].program}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo[0].utility}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}

      <Typography variant="h4" sx={{ marginBottom: 1, marginTop: 3 }}>
        Field Metric Baseline Regression
      </Typography>
    </Box>
  );
}
