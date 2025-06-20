// src/components/FAQ.js
import React from "react";
import { Typography } from "@mui/material";

const CitationComponent = () => {

  return (
    <Typography
        variant="body1"
        color="white.main"
    >
        Leong, Michael and Mahanta, Medha and Yin, Clara and Garcia, TJ
        and Tan, Zach and Prakash, Anand K. and Black, Doug and Yin,
        Rongxin, DFAT: A Web-Based Toolkit for Estimating Demand
        Flexibility in Building-to-Grid Integration. Available at SSRN:{" "}
        <a
        href="https://ssrn.com/abstract=4968003"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2196f3" }}
        >
        https://ssrn.com/abstract=4968003{" "}
        </a>
        or{" "}
        <a
        href="http://dx.doi.org/10.2139/ssrn.4968003"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2196f3" }}
        >
        http://dx.doi.org/10.2139/ssrn.4968003{" "}
        </a>
    </Typography>
  );
};

export default CitationComponent;
