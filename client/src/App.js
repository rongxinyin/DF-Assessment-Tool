import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Home from "./components/Home";
import Advanced from "./components/Advanced";


export default function App() {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advanced" element={<Advanced />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
