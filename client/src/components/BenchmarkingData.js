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

export default function BenchmarkingData() {


  return (
    <div>
      <h1>Benchmarking Data</h1>
    </div>
  );
}
