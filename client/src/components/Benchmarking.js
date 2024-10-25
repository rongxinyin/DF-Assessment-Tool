import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { IconLayer } from "@deck.gl/layers";
import axios from "axios";
import mapbox_token from "./mapbox_token.js";
import BenchmarkingData from "./BenchmarkingData.js";
import FilterMenu from "./FilterMenu.js";

const MAPBOX_ACCESS_TOKEN = mapbox_token;
const MAP_STYLE = "mapbox://styles/mapbox/streets-v11"; // Updated to Streets style

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
  // Add more regions as needed
};

const getBenchmarkingCollection = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/benchmarking/getAll"
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

  const handleRegionChange = (region) => {
    setViewState(regions[region]);
  };

  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 120, height: 120, mask: true },
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
    getColor: (d) => [Math.sqrt(d.exits), 140, 0],
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gridTemplateRows: "50% 50%",
        height: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          gridRow: "1 / span 2",
          gridColumn: "1 / 2",
          backgroundColor: "#f0f0f0",
          padding: "10px",
        }}
      >
        <FilterMenu filters={filters} setFilters={setFilters} />
      </div>
      <div
        style={{
          gridRow: "1 / 2",
          gridColumn: "2 / 3",
          position: "relative",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          borderBottom: "2px solid #ccc",
          marginTop: "20px",
        }}
      >
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
          <button onClick={() => handleRegionChange("california")}>
            California
          </button>
          <button onClick={() => handleRegionChange("usa")}>Reset</button>
        </div>
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
            \n Click for detailed information`
          }
          onClick={onClick}
        >
          <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
        </DeckGL>
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
          <button
            onClick={() =>
              setViewState({ ...viewState, zoom: viewState.zoom + 1 })
            }
          >
            +
          </button>
          <button
            onClick={() =>
              setViewState({ ...viewState, zoom: viewState.zoom - 1 })
            }
          >
            -
          </button>
          <button onClick={() => setViewState(INITIAL_VIEW_STATE)}>
            Reset
          </button>
        </div>
      </div>
      <div
        style={{
          gridRow: "2 / 3",
          gridColumn: "2 / 3",
          backgroundColor: "#f0f0f0",
          padding: "40px",
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {selectedSite && (
          <BenchmarkingData
            selectedSite={selectedSite}
            model={model}
            chooseModel={chooseModel}
          />
        )}
      </div>
    </div>
  );
}
