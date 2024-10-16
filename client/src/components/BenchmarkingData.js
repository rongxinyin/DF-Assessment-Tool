import React from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import moment from "moment-timezone";

export default function BenchmarkingData({ selectedSite, model, chooseModel }) {
  const createFieldMetricBaselineRegressionRows = () => {
    let rows = [];
    if (selectedSite && selectedSite.fieldMetricBaselineRegression) {
      rows = selectedSite.fieldMetricBaselineRegression.map((event) => ({
        event_id: event.event_id,
        event_date: event.event_date,
        shed_start_time_date: event.shed_start_time_date,
        shed_end_time_date: event.shed_end_time_date,
        peak_oat: event.peak_oat,
        event_avg_oat: event.event_avg_oat,
        peak_demand_intensity_wft2: event.peak_demand_intensity_wft2,
        shed_avg_wft2: event.shed_avg_wft2,
      }));
    }
    return rows;
  };

  return (
    <Box sx={{ margin: 3, flexGrow: 1 }}>
      <Typography variant="h4" sx={{ marginBottom: 1 }}>
        Site Info
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="site info table">
          <TableHead>
            <TableRow>
              <TableCell>Site ID</TableCell>
              <TableCell align="right">DOE Climate Zone</TableCell>
              <TableCell align="right">City</TableCell>
              <TableCell align="right">State</TableCell>
              <TableCell align="right">Zip</TableCell>
              <TableCell align="right">Number of Floors</TableCell>
              <TableCell align="right">Total Building Area (ft²)</TableCell>
              <TableCell align="right">Net Selling Area (ft²)</TableCell>
              <TableCell align="right">Total Stock Area (ft²)</TableCell>
              <TableCell align="right">Number of HVAC</TableCell>
              <TableCell align="right">Program</TableCell>
              <TableCell align="right">Utility</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{selectedSite.siteID}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.doe_climate_zone}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.city}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.state}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.zip}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.number_of_floor}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.total_building_area_ft2}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.net_selling_area_ft2}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.total_stock_area_ft2}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.number_of_HVAC}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.program}</TableCell>
              <TableCell align="right">{selectedSite.siteInfo.utility}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container alignItems="center" spacing={2} sx={{ mt: 3 }}>
        <Grid item>
          <Typography variant="h4">DF Metrics</Typography>
        </Grid>
        <Grid item>
          <FormControl variant="filled" sx={{ m: 1, width: 300 }}>
            <InputLabel id="select-model-label">Model</InputLabel>
            <Select
              labelId="select-model-label"
              id="select-model"
              value={model}
              onChange={chooseModel}
            >
              <MenuItem value={"regressionBaseline"}>Regression Baseline</MenuItem>
              <MenuItem value={"10/10Average"}>10/10 Average</MenuItem>
              <MenuItem value={"adjusted10/10Average"}>Adjusted 10/10 Average</MenuItem>
              <MenuItem value={"weatherRegression"}>Weather Regression</MenuItem>
              <MenuItem value={"adjustedWeatherRegression"}>Adjusted Weather Regression</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="DF metrics table">
          <TableHead>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell align="right">Event Date</TableCell>
              <TableCell align="right">Shed Start Time (GMT-8)</TableCell>
              <TableCell align="right">Shed End Time (GMT-8)</TableCell>
              <TableCell align="right">Peak OAT (°F)</TableCell>
              <TableCell align="right">Event Average OAT (°F)</TableCell>
              <TableCell align="right">Peak Demand Intensity (W/ft²)</TableCell>
              <TableCell align="right">Avg. Demand Decrease Intensity (W/ft²)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {createFieldMetricBaselineRegressionRows().map((row) => (
              <TableRow key={row.event_id}>
                <TableCell>{row.event_id}</TableCell>
                <TableCell align="right">{moment.utc(row.event_date).format("MM/DD/YY")}</TableCell>
                <TableCell align="right">
                  {moment.utc(row.shed_start_time_date).tz("America/Los_Angeles").hour(moment(row.shed_start_time_date).hours() - 1).format("MM/DD/YYYY HH:mm:ss")}
                </TableCell>
                <TableCell align="right">
                  {moment.utc(row.shed_end_time_date).tz("America/Los_Angeles").hour(moment(row.shed_end_time_date).hours() - 1).format("MM/DD/YYYY HH:mm:ss")}
                </TableCell>
                <TableCell align="right">{parseInt(row.peak_oat)}</TableCell>
                <TableCell align="right">{parseInt(row.event_avg_oat)}</TableCell>
                <TableCell align="right">{Math.round(row.peak_demand_intensity_wft2 * 100) / 100}</TableCell>
                <TableCell align="right">{Math.round(row.shed_avg_wft2 * 100) / 100}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}