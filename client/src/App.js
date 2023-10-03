import { ThemeProvider, createTheme } from "@mui/material";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import About from "./components/About.js";
import Advanced from "./components/Advanced.js";
import Basic from "./components/Basic.js";
import FAQ from "./components/FAQ.js";
import Home from "./components/Home.js";
import NotFound from "./components/NotFound.js";
import UserGuide from "./components/UserGuide.js";
import Benchmarking from "./components/Benchmarking.js";

import AppBar from "./components/SiteAppBar.js";

const theme = createTheme({
  typography: {
    button: {
      textTransform: "none",
    },
  },
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
            <Route path="/benchmarking" element={<Benchmarking />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
