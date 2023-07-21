import * as React from "react";
import {
  createTheme,
  ThemeProvider, 
  Box,
  Grid, 
  Button,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

//colors
const theme = createTheme({
  palette: {
    primary: {
      // darker blue
      main: "#00303C",
    },
    secondary: {
      // medium blue
      main: "#007681",
    },
    white: {
      main: "#F0F0F0",
    },
  },

});


export default function FAQ() {
  return (

  <ThemeProvider theme={theme}> 
  <Box bgcolor={"primary.main"} p={2}>
    <Grid container my={2} rowSpacing={1} columnSpacing={1} textAlign={"center"} >
      <Grid item  sm={6} p={4}> 
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
        Lorem ipsum dolor sit amet?
        </Typography>
        <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main">
          consectetur adipiscing elit.
          </Typography>    
        </Box>
        <br></br>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
        How can solar panels help reduce building energy usage?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main">
          Solar panels can generate clean electricity from sunlight, '
          allowing buildings to offset their energy consumption by using renewable energy, 
          thereby reducing their reliance on conventional energy sources and lowering their carbon footprint.
          </Typography>    
        </Box>
        <br></br>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
        What is solar energy?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main">
          Solar energy is a sustainable and renewable form of power derived from the sun's radiation. It is harnessed using photovoltaic cells or solar thermal collectors,
          converting sunlight into electricity or heat to meet various energy needs. As an eco-friendly alternative to fossil fuels, 
          solar power contributes to reducing greenhouse gas emissions and mitigating climate change while promoting energy independence and resilience.
          </Typography>    
        </Box>
        <br></br>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
        What is a Packet RTU?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main">
          An HVAC packaged rooftop unit (RTU) is a self-contained system used for heating and cooling in commercial buildings. It is installed on the roof or ground and contains 
          all major components within a single enclosure, including the compressor, condenser, evaporator, blower, and sometimes a heating element. RTUs are space-saving, energy-efficient, 
          and easy to maintain, making them a popular choice for commercial applications.
          </Typography>    
        </Box>

      </Grid>

      <Grid item sm={6} p={4}>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main"> 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
          </Typography>
        </Box>
        <br></br>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
          How can solar power help reduce building energy usage?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main"> 
          Solar power reduces building energy usage by converting sunlight into electricity, promoting sustainability.
          </Typography>
        </Box>
        <br></br>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
          What is the main advantage of using solar power in buildings?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main"> 
          The main advantage of using solar power in buildings is that it provides a clean and renewable energy source, reducing greenhouse gas emissions and dependence on fossil fuels.
          </Typography>
        </Box>
        <br></br>
        <Typography variant="h5" color="white.main" sx={{ fontWeight: "bold", m: 1 }} gutterBottom>
        What is the energy duck curve, and why is it important in the context of energy consumption?
        </Typography>
        <Box bgcolor="secondary.main" p={2} sx={{ borderRadius: '5px', border: "2px solid #F0F0F0",}}>
          <Typography variant="h6" color="white.main"> 
          The energy duck curve represents the fluctuation of energy demand throughout the day, particularly in regions with high solar power capacity. It is important because it 
          highlights the challenges of balancing supply and demand, as it shows a significant drop in demand during peak solar production, followed by a steep increase during the evening 
          when solar generation decreases. This curve emphasizes the need for energy storage solutions and grid flexibility to manage the variability of renewable energy sources effectively.
          </Typography>
        </Box>

      </Grid>
    </Grid>
    <Grid container my={2} rowSpacing={1} columnSpacing={1} textAlign={"center"} >
      <Grid item sm={12} p={4}> 
        <Button
          href="https://github.com/rongxinyin/DR-Estimation-Tool"
          variant="contained"
          color="secondary"
          textAlign="center"
          sx={{
          border: "2px solid #F0F0F0",
          fontWeight: "bold",
          marginTop: 2,
          marginBottom: 3,
          width: "50%",
          height: "50px",
          }}
          >
          More FAQ
          </Button>
      </Grid>
    </Grid>
  </Box>
  </ThemeProvider>
  );
}
