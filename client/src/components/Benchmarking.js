import React from "react";
import DeckGL from "@deck.gl/react";
import { LineLayer } from "@deck.gl/layers";
import { GeoJsonLayer } from "deck.gl";
import { Map } from "react-map-gl";
import data from "./testdata.json";
import mapbox_token from "./mapbox_token.js";

import { useNavigate } from "react-router-dom";

// TODO: REGISTER AND GET A FREE TOKEN.
// FREE OF CHARGE UNTIL CERTAIN TRAFFIC IS REACHED
// https://www.mapbox.com/pricing/

const MAPBOX_ACCESS_TOKEN = mapbox_token;
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};

export default function BenchMarking() {
  let navigate = useNavigate(); // navigate to diff pages

  const onClick = (info) => {
    if (info.object) {
      alert(info.object.properties.Name);
    }
  };

  const layers = [
    new GeoJsonLayer({
      id: "test",
      data: data,
      filled: true,
      pointRadiusMinPixels: 1,
      pointRadiusScale: 2000,
      getPointRadius: (f) => 1,
      getFillColor: [86, 144, 58, 250],
      pickable: true,
      autoHighlight: true,
      onClick,
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}
