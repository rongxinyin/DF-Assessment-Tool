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
import moment from "moment-timezone";

function createFieldMetricBaselineRegerssionData(
  event_id,
  event_date,
  shed_start_time_date,
  shed_end_time_date,
  peak_oat,
  event_avg_oat,
  peak_demand_intensity_wft2,
  shed_avg_wft2
) {
  return {
    event_id,
    event_date,
    shed_start_time_date,
    shed_end_time_date,
    peak_oat,
    event_avg_oat,
    peak_demand_intensity_wft2,
    shed_avg_wft2,
  };
}

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

  function createfieldMetricBaselineRegerssionRows() {
    let rows = [];
    if (siteData && siteData.fieldMetricBaselineRegression) {
      for (var i = 0; i < siteData.fieldMetricBaselineRegression.length; i++) {
        rows.push(
          createFieldMetricBaselineRegerssionData(
            siteData.fieldMetricBaselineRegression[i].event_id,
            siteData.fieldMetricBaselineRegression[i].event_date,
            siteData.fieldMetricBaselineRegression[i].shed_start_time_date,
            siteData.fieldMetricBaselineRegression[i].shed_end_time_date,
            siteData.fieldMetricBaselineRegression[i].peak_oat,
            siteData.fieldMetricBaselineRegression[i].event_avg_oat,
            siteData.fieldMetricBaselineRegression[i]
              .peak_demand_intensity_wft2,
            siteData.fieldMetricBaselineRegression[i].shed_avg_wft2
          )
        );
      }
    }
    return rows;
  }

  const fieldMetricBaselineRegerssionRows =
    createfieldMetricBaselineRegerssionRows();

  useEffect(() => {
    getSiteData().then((data) => {
      setSiteData(data);
    });
  }, []);

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
                  {siteData.siteInfo.doe_climate_zone}
                </TableCell>
                <TableCell align="right">{siteData.siteInfo.city}</TableCell>
                <TableCell align="right">{siteData.siteInfo.state}</TableCell>
                <TableCell align="right">{siteData.siteInfo.zip}</TableCell>
                <TableCell align="right">
                  {siteData.siteInfo.number_of_floor}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo.total_building_area_ft2}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo.net_selling_area_ft2}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo.total_stock_area_ft2}
                </TableCell>
                <TableCell align="right">
                  {siteData.siteInfo.number_of_HVAC}
                </TableCell>
                <TableCell align="right">{siteData.siteInfo.program}</TableCell>
                <TableCell align="right">{siteData.siteInfo.utility}</TableCell>
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

      {siteData ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell align="right">Event Date</TableCell>
                <TableCell align="right">Shed Start Time (GMT-8)</TableCell>
                <TableCell align="right">Shed End Time (GMT-8)</TableCell>
                <TableCell align="right">Peak OAT</TableCell>
                <TableCell align="right">Event Average OAT </TableCell>
                <TableCell align="right">Peak Demand Intensity</TableCell>
                <TableCell align="right">Shed Average</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldMetricBaselineRegerssionRows.map((row) => (
                <TableRow
                  key={row.event_id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.event_id}
                  </TableCell>
                  <TableCell align="right">
                    {moment.utc(row.event_date).format("MM/DD/YY")}
                  </TableCell>
                  <TableCell align="right">
                    {moment
                      .utc(row.shed_start_time_date)
                      .tz("America/Los_Angeles")
                      .hour(moment(row.shed_start_time_date).hours() - 1)
                      .format("MM/DD/YYYY HH:mm:ss")}
                  </TableCell>
                  <TableCell align="right">
                    {moment
                      .utc(row.shed_end_time_date)
                      .tz("America/Los_Angeles")
                      .hour(moment(row.shed_end_time_date).hours() - 1)
                      .format("MM/DD/YYYY HH:mm:ss")}
                  </TableCell>
                  <TableCell align="right">{row.peak_oat}</TableCell>
                  <TableCell align="right">{row.event_avg_oat}</TableCell>
                  <TableCell align="right">
                    {row.peak_demand_intensity_wft2}
                  </TableCell>
                  <TableCell align="right">{row.shed_avg_wft2}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
}
