import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import React, { useState } from 'react';

const data =
  [
    {
      question: "How can solar panels help reduce building energy usage?",
      answer: "Solar panels can generate clean electricity from sunlight, ' allowing buildings to offset their energy consumption by using renewable energy, thereby reducing their reliance on conventional energy sources and lowering their carbon footprint."
    },
    {
      question: "How can solar power help reduce building energy usage?",
      answer: "Solar power reduces building energy usage by converting sunlight into electricity, promoting sustainability."
    },
    {
      question: "What is solar energy?",
      answer: "Solar energy is a sustainable and renewable form of power derived from the sun's radiation. It is harnessed using photovoltaic cells or solar thermal collectors, converting sunlight into electricity or heat to meet various energy needs. As an eco-friendly alternative to fossil fuels, solar power contributes to reducing greenhouse gas emissions and mitigating climate change while promoting energy independence and resilience."
    },
    {
      question: "What is the main advantage of using solar power in buildings?",
      answer: "The main advantage of using solar power in buildings is that it provides a clean and renewable energy source, reducing greenhouse gas emissions and dependence on fossil fuels."
    },
    {
      question: "What is a Packet RTU?",
      answer: "An HVAC packaged rooftop unit (RTU) is a self-contained system used for heating and cooling in commercial buildings. It is installed on the roof or ground and contains all major components within a single enclosure, including the compressor, condenser, evaporator, blower, and sometimes a heating element. RTUs are space-saving, energy-efficient, and easy to maintain, making them a popular choice for commercial applications."
    },
    {
      question: "What is the energy duck curve, and why is it important in the context of energy consumption?",
      answer: "The energy duck curve represents the fluctuation of energy demand throughout the day, particularly in regions with high solar power capacity. It is important because it highlights the challenges of balancing supply and demand, as it shows a significant drop in demand during peak solar production, followed by a steep increase during the evening when solar generation decreases. This curve emphasizes the need for energy storage solutions and grid flexibility to manage the variability of renewable energy sources effectively."
    },
    // Add more questions and answers as needed
  ];


const Faqcomponent = ({ data }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="faq">
      <Typography variant="h4" color="common.white" sx={{ marginTop: 5 }}>Frequently Asked Questions</Typography>
      {data.map((item, index) => (
        <div key={index}>
          <Button style={{
            borderRadius: 35,
            backgroundColor: 'secondary',
            color: "white",
            fontSize: "18px",
            padding: "18px 36px",
            marginBottom: 5
          }}
            color="inherit"
            variant="outlined"
            onClick={() => toggleQuestion(index)}>
            {item.question}
          </Button>
          {openIndex === index && <Typography
            variant="h6"
            color="common.white"
            sx={{ margin: 1 }}
          >{item.answer}</Typography>}
        </div>
      ))}
    </div>
  );
};


export default function FAQ() {
  return (
    <Box bgcolor={"primary.main"} p={2}>
      <Faqcomponent data={data} />
    </Box>
  );
}
