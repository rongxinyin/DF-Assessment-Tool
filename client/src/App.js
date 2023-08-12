import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";

import Home from "./components/Home.js";
import Advanced from "./components/Advanced.js";
import FAQ from "./components/FAQ.js";
import UserGuide from "./components/UserGuide.js";
import About from "./components/About.js";
import Basic from "./components/Basic.js";
import NotFound from "./components/NotFound.js";

import AppBar from "./components/SiteAppBar.js";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00303C", // dark teal
    },
    secondary: {
      main: "#007681", // teal
    },
    tertiary: {
      main: "#BED7DD", // light blue
    },
    white: {
      main: "#FFFFFF", // white
    },
  },
  typography: {
    primary: {
      main: "#00303C", // dark teal
    },
    secondary: {
      main: "#007681", // teal
    },
    tertiary: {
      main: "#BED7DD", // light blue
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
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
