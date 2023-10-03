import React from "react";
import DeckGL from "@deck.gl/react";
import { LineLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl";

import { useNavigate } from "react-router-dom";

// TODO: REGISTER AND GET A FREE TOKEN.
// FREE OF CHARGE UNTIL CERTAIN TRAFFIC IS REACHED
// https://www.mapbox.com/pricing/
const MAPBOX_ACCESS_TOKEN = "your_mapbox_token";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};

// Data to be used by the LineLayer
const data = [
  {
    sourcePosition: [-122.41669, 37.7853],
    targetPosition: [-122.41669, 37.781],
  },
];

export default function BenchMarking() {
  let navigate = useNavigate(); // navigate to diff pages

  const layers = [new LineLayer({ id: "line-layer", data })];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}
