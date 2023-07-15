import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Home from "./components/Home";
import Advanced from "./components/Advanced";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00303C",
    },
    secondary: {
      main: "#007681",
    },
    tertiary: {
      main: "#BED7DD",
    },
  },
});


export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/advanced" element={<Advanced />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

    </ThemeProvider>
  );
}
