import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { IconLayer } from "@deck.gl/layers";
import axios from "axios";
import mapbox_token from "./mapbox_token.js";
import BenchmarkingData from "./BenchmarkingData.js";
import FilterMenu from "./FilterMenu.js";
import { Box, Button, Grid, Paper } from "@mui/material";

const MAPBOX_ACCESS_TOKEN = mapbox_token;
const MAP_STYLE = "mapbox://styles/mapbox/streets-v11";

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 39,
  zoom: 3.5,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
};

const regions = {
  california: { longitude: -119.4179, latitude: 36.7783, zoom: 5 },
  usa: { longitude: -98, latitude: 39, zoom: 3.5 },
};

const getBenchmarkingCollection = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/benchmarking/getAll"
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export default function Benchmarking() {
  const [benchmarkingData, setBenchmarkingData] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [model, setModel] = useState("regressionBaseline");
  const [filters, setFilters] = useState({
    residential: true,
    commercial: true,
    city: "",
  });
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  useEffect(() => {
    getBenchmarkingCollection().then(setBenchmarkingData);
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

  const handleRegionChange = (region) => {
    setViewState(regions[region]);
  };

  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true },
  };

  const layers = new IconLayer({
    id: "icon-layer",
    data: benchmarkingData,
    pickable: true,
    iconAtlas:
      "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconMapping: ICON_MAPPING,
    getIcon: (d) => "marker",
    sizeScale: 6,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getColor: (d) => [0, 118, 129],
  });

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={9}>
        <Box sx={{ height: "50%", position: "relative", marginTop: 3 }}>
          <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
            <Button
              variant="contained"
              onClick={() => handleRegionChange("california")}
            >
              California
            </Button>
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={() => handleRegionChange("usa")}
            >
              Reset
            </Button>
          </Box>
          <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState }) => setViewState(viewState)}
            controller={true}
            layers={[layers]}
            getTooltip={({ object }) =>
              object &&
              `${object.siteInfo.city}, ${object.siteInfo.state}
              \nSite ID: ${object.siteID}
              \nDOE Climate Zone: ${object.siteInfo.doe_climate_zone}
              \nClick for detailed information`
            }
            onClick={onClick}
          >
            <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
          </DeckGL>
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
            <Button
              variant="contained"
              onClick={() =>
                setViewState({ ...viewState, zoom: viewState.zoom + 1 })
              }
            >
              +
            </Button>
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={() =>
                setViewState({ ...viewState, zoom: viewState.zoom - 1 })
              }
            >
              -
            </Button>
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={() => setViewState(INITIAL_VIEW_STATE)}
            >
              Reset
            </Button>
          </Box>
        </Box>
        <Paper elevation={3} sx={{ height: "50%", p: 3 }}>
          {selectedSite && (
            <BenchmarkingData
              selectedSite={selectedSite}
              model={model}
              chooseModel={chooseModel}
            />
          )}
        </Paper>
      </Grid>
      <Grid item xs={3}>
        <Paper elevation={3} sx={{ height: "100%", p: 3, marginTop: 3 }}>
          <FilterMenu filters={filters} setFilters={setFilters} />
        </Paper>
      </Grid>
    </Grid>
  );
}
