import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { LineLayer } from "@deck.gl/layers";
import { GeoJsonLayer } from "deck.gl";
import { Map } from "react-map-gl";
import mapbox_token from "./mapbox_token.js";
import { IconLayer } from "@deck.gl/layers";
import axios from "axios";
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

const MAPBOX_ACCESS_TOKEN = mapbox_token;
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -111,
  latitude: 33,
  zoom: 5.5,
  maxZoom: 20,
  pitch: 30,
  bearing: 0,
};

// retrieve benchmarking collection data from database
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

// https://deck.gl/docs/api-reference/layers/icon-layer
export default function Benchmarking() {
  let navigate = useNavigate(); // navigate to diff pages

  const [benchmarkingData, setBenchmarkingData] = useState();

  useEffect(() => {
    getBenchmarkingCollection().then((data) => {
      setBenchmarkingData(data);
    });
  }, []);

  const onClick = (info) => {
    if (info.object) {
      const siteID = info.object.siteID;
      // Use the navigate function to go to a new page with the siteID parameter
      navigate(`/benchmarking/${siteID}`);
    }
  };

  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 120, height: 120, mask: true },
  };

  const layers = new IconLayer({
    id: "icon-layer",
    data: benchmarkingData,
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
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
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={[layers]}
      getTooltip={({ object }) =>
        object &&
        `${object.siteInfo[0].city}, ${object.siteInfo[0].state} \
        \nSite ID: ${object.siteID} \
        \nDOE Climate Zone: ${object.siteInfo[0].doe_climate_zone}
        \n Click for detailed information`
      }
      onClick={onClick}
    >
      <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}
