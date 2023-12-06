import { Box, Button, Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import InfoListComponent from "./InfoListComponent.js";

const data = [
  {
    question: "What do the calculators do?",
    answer:
      "The basic calculator uses building information (such as size and build year) and local weather and meter data to calculate shed potential for various precool and event temperature offsets. The advanced calculator uses information about the customer's RTUs, as well as normal and reset temperature setpoints, to calculate total demand response load reduction.",
  },
  {
    question: "How do I use the basic calculator?",
    answer:
      "For the basic user inputs, start by inputing in your building name and building type. Follow that up by adding your building's floor area and height in square feet (ft²). Pick which type of HVAC system your builidng has (most common is the Package RTU). Find your electrical meter (usually found on the outside part of your house) and input the peak demand (kW). Finally, input your zipcode and state. For the HVAC Temp DR Shed Capacity calculation, input the percentage of building floor area that GTA will apply. This is how much of your room or building will be affected. Input the precool period temp offset. Finally add the demand response temperature offset. For the OAT and kW during the DR event hours, input the outside air temperature (OAT) and meter kW at that certain hour. For example, first hour is 76°F and meter reading is 733 kW. Add these values to the input table for all 4 hours.",
  },
  {
    question: "How can solar panels help reduce building energy usage?",
    answer:
      "Solar panels can generate clean electricity from sunlight, ' allowing buildings to offset their energy consumption by using renewable energy, thereby reducing their reliance on conventional energy sources and lowering their carbon footprint.",
  },
  {
    question: "How can solar power help reduce building energy usage?",
    answer:
      "Solar power reduces building energy usage by converting sunlight into electricity, promoting sustainability.",
  },
  {
    question: "What is solar energy?",
    answer:
      "Solar energy is a sustainable and renewable form of power derived from the sun's radiation. It is harnessed using photovoltaic cells or solar thermal collectors, converting sunlight into electricity or heat to meet various energy needs. As an eco-friendly alternative to fossil fuels, solar power contributes to reducing greenhouse gas emissions and mitigating climate change while promoting energy independence and resilience.",
  },
  {
    question: "What is the main advantage of using solar power in buildings?",
    answer:
      "The main advantage of using solar power in buildings is that it provides a clean and renewable energy source, reducing greenhouse gas emissions and dependence on fossil fuels.",
  },
  {
    question: "What is a Packet RTU?",
    answer:
      "An HVAC packaged rooftop unit (RTU) is a self-contained system used for heating and cooling in commercial buildings. It is installed on the roof or ground and contains all major components within a single enclosure, including the compressor, condenser, evaporator, blower, and sometimes a heating element. RTUs are space-saving, energy-efficient, and easy to maintain, making them a popular choice for commercial applications.",
  },
  {
    question:
      "What is the energy duck curve, and why is it important in the context of energy consumption?",
    answer:
      "The energy duck curve represents the fluctuation of energy demand throughout the day, particularly in regions with high solar power capacity. It is important because it highlights the challenges of balancing supply and demand, as it shows a significant drop in demand during peak solar production, followed by a steep increase during the evening when solar generation decreases. This curve emphasizes the need for energy storage solutions and grid flexibility to manage the variability of renewable energy sources effectively.",
  },
  // Add more questions and answers as needed
];

export default function FAQ() {
  return (
    <Box bgcolor={"primary.main"} p={2}>
      <Typography
        variant="h4"
        color="common.white"
        sx={{ marginTop: 5, marginBottom: 1 }}
      >
        Frequently Asked Questions
      </Typography>
      <InfoListComponent data={data} />
    </Box>
  );
}
