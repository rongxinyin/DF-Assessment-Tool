import { ThemeProvider, createTheme } from "@mui/material";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import About from "./components/About.js";
import Advanced from "./components/Advanced.js";
import Basic from "./components/Basic.js";
import FAQ from "./components/FAQ.js";
import Home from "./components/Home.js";
import NotFound from "./components/NotFound.js";
import Benchmarking from "./components/Benchmarking.js";
import BenchmarkingData from "./components/BenchmarkingData.js";
import ResidentialLanding from "./components/ResidentialLanding.js";
import HouseType from "./components/HouseType.js";
import Location from "./components/Location.js";
import ResultsPage from "./components/ResultsPage.js";
import Appliances from "./components/Appliances.js";
import Calculation from "./components/Calculation.js";

import AppBar from "./components/SiteAppBar.js";

const theme = createTheme({
    typography: {
        fontFamily: '"Open Sans", sans-serif',
        button: {
            textTransform: "none",
            fontSize: "medium",
        },
    },
    /*
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
    */
    palette: {
        primary: {
            main: "#FFFFFF",
        },
        secondary: {
            main: "#EEEEEE",
        },
        tertiary: {
            main: "#EEEEEE",
        },
        white: {
            main: "#FFFFFF",
        },
    },
    typography: {
        primary: {
            main: "#000000",
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
                        <Route path="/about" element={<About />} />
                        <Route path="/benchmarking" element={<Benchmarking />} />
                        <Route
                            path="/benchmarking/:site_id"
                            element={<BenchmarkingData />}
                        />
                        <Route path="/*" element={<NotFound />} />
                        <Route path="/residential" element={<ResidentialLanding />} />

                        <Route path="/residential/house_type" element={<HouseType />} />
                        <Route path="/residential/location" element={<Location />} />
                        <Route path="/residential/results" element={<ResultsPage />} />
                        <Route path="/residential/calculation" element={<Calculation />} />
                        <Route path="/residential/appliances" element={<Appliances />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
}
