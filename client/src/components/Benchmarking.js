import React from "react";
import DeckGL from "@deck.gl/react";
import { LineLayer } from "@deck.gl/layers";
import { GeoJsonLayer } from "deck.gl";
import { Map } from "react-map-gl";
import data from "./testdata.json";
import mapbox_token from "./mapbox_token.js";
import { IconLayer } from "@deck.gl/layers";
import axios from "axios";
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

// TODO: REGISTER AND GET A FREE TOKEN.
// FREE OF CHARGE UNTIL CERTAIN TRAFFIC IS REACHED
// https://www.mapbox.com/pricing/

const MAPBOX_ACCESS_TOKEN = mapbox_token;
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
};

//HELP
// need to retrieve benchmarking data from the database and port it over to the MapGL to display all the building data
// data is already there but idk how to get it
const getBenchmarkingCollection = async () => {
  const result = await fetch("http://localhost:8080/benchmarking/getAll").then(
    (response) => response.json()
  );
  return result;
};

// https://deck.gl/docs/api-reference/layers/icon-layer

export default function Benchmarking() {
  let navigate = useNavigate(); // navigate to diff pages

  const onClick = (info) => {
    if (info.object) {
      alert(info.object.properties.Name);
    }
  };

  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 120, height: 120, mask: true },
  };

  const layers = new IconLayer({
    id: "icon-layer",
    data,
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
      layers={layers}
      getTooltip={({ object }) => object && `${object.name}\n${object.address}`}
    >
      <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>

    // // test button
    // <Button sx={{ marginTop: 10 }} onClick={() => console.log(fetch('http://localhost:8080/benchmarking/getAll'))}>hiii</Button>
  );
}
