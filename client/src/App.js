import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Home from "./components/Home";
import Advanced from "./components/Advanced";
import FAQ from "./components/FAQ";
import UserGuide from "./components/UserGuide";
import About from "./components/About";
import Basic from "./components/Basic";

import AppBar from "./components/SiteAppBar";

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
    white: {
      main: "#FFFFFF",
    },
  },
  typography: {
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
  mode: "dark",
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppBar />
        <Suspense>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/basic" element={<Basic />} />
            <Route path="/advanced" element={<Advanced />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/userguide" element={<UserGuide />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
