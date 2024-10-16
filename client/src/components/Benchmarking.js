import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { IconLayer } from "@deck.gl/layers";
import axios from "axios";
import mapbox_token from "./mapbox_token.js";
import BenchmarkingData from './BenchmarkingData.js';

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
            height: '60%', // popup window height
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
          
          <BenchmarkingData
            selectedSite={selectedSite}
            model={model}
            chooseModel={chooseModel}
          />
        </div>
      )}
    </div>
  );
}