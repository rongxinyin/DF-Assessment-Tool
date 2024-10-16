import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { IconLayer } from "@deck.gl/layers";
import axios from "axios";
import mapbox_token from "./mapbox_token.js";
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

const MAPBOX_ACCESS_TOKEN = mapbox_token;
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: -111,
  latitude: 33,
  zoom: 5.5,
  maxZoom: 20,
  pitch: 30,
  bearing: 0,
};

const getBenchmarkingCollection = async () => {
  try {
    const response = await axios.get("http://localhost:8080/benchmarking/getAll");
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

export default function Benchmarking() {
  const [benchmarkingData, setBenchmarkingData] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [model, setModel] = useState("regressionBaseline");

  useEffect(() => {
    getBenchmarkingCollection().then((data) => {
      setBenchmarkingData(data);
    });
  }, []);

  const onClick = (info) => {
    if (info.object) {
      setSelectedSite(info.object);
      setIsPanelOpen(true);
    }
  };

  const chooseModel = (event) => {
    setModel(event.target.value);
  };

  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 120, height: 120, mask: true },
  };

  const layers = new IconLayer({
    id: "icon-layer",
    data: benchmarkingData,
    pickable: true,
    iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconMapping: ICON_MAPPING,
    getIcon: (d) => "marker",
    sizeScale: 6,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getColor: (d) => [Math.sqrt(d.exits), 140, 0],
  });

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
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[layers]}
        getTooltip={({ object }) =>
          object &&
          `${object.siteInfo.city}, ${object.siteInfo.state}
          \nSite ID: ${object.siteID}
          \nDOE Climate Zone: ${object.siteInfo.doe_climate_zone}
          \n Click for detailed information`
        }
        onClick={onClick}
      >
        <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
      </DeckGL>

      {isPanelOpen && selectedSite && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%', // popup window height
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            transition: 'transform 0.3s ease-out',
            transform: isPanelOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <button 
            onClick={() => setIsPanelOpen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '1.5em',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
          
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
        </div>
      )}
    </div>
  );
}