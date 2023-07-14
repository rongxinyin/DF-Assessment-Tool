import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Home from "./components/Home.js";

export default function App() {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
