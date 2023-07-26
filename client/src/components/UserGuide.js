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


export default function UserGuide() {
  let navigate = useNavigate();

  return (
    <ThemeProvider theme={theme} >
      <Box bgcolor={"primary.main"} p={2} >
        <Grid Container my={1} width="100%" height="100%" direction="column" justifyContent={"flex-start"} alignItems={"flex-start"}> 

          <Grid item p={2} textAlign={"center"} mb={2} mt={2}>
            <Typography mb={2} variant="h5" color="white.main" textAlign={"center"} sx={{fontWeight: "bold"}}>
            Which Calculator is best for you? 
            </Typography>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", }}>
            <Typography variant="h6" color="white.main" textAlign={"center"} >
            Basic: As the name suggests, this allows you to get up and running with the simpliest 
            inputs to get the Demand Response calculator to work.
            <br></br>
            <Typography variant="h6" color="white.main" textAlign={"center"} sx={{fontWeight:"bold"}}>
            OR 
            </Typography>
            Advance: For the people that would like to have more precise estimations and control over the inputs such as  
            contorlling the HVAC inputs and Efficiency. Then, Advance is the best choice for you. 
            </Typography>    
            </Box>
          </Grid>
        </Grid>
        <hr></hr>

        <Grid Container my={1} width="100%" height="100%" direction="column" justifyContent={"flex-start"} alignItems={"flex-start"}> 
          <Grid item sm={12} p={3} >
            <Typography variant="h4" color="white.main" textAlign={"Center"} sx={{fontWeight: "bold"}} >
            Basic Guide
            </Typography>
          </Grid>
          <Grid item sm={12} p={1} >
            <Typography variant="h5" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              Basic User Inputs
            </Typography>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", }}>
            <Typography variant="h6" color="white.main" textAlign={"left"} >
              Start by inputing in your building name and building type. Follow that up by adding your buildings floor area 
              and height in square feet (ft²). Pick which type of HVAC system your builidng has (most common is the Package RTU). Find your 
              electrical meter (usually found on the outside part of your house) and input the peak demand (kW). Finally, input your zipcode and State!  
            </Typography>
            </Box>
            <Typography mt={3} variant="h5" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
            HVAC Temp DR Shed Capacity Calculation
            </Typography>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", }}>
            <Typography variant="h6" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              Input the percentage of building floor area that GTA will apply. This basically means how much of your room or building is getting affected. Input the precool period temp offset. Finally add 
              the demand response temperature offeset. 
            </Typography>
            </Box>
            <Typography mt={3} variant="h5" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
            OAT and kW During the DR Event Hours
            </Typography>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", }}>
            <Typography variant="h6" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              For this part you are inputing the outside air temperature (OAT) and meter kW at that certain hour. So if the OAT at the first hour is 76°F and then your meter reading 
              is 733 kW. Add that to the chart and continue to do the same for the following hours. 
            </Typography>
            </Box>
            <Typography mt={5}variant="h5" color="white.main" textAlign={"Center"} sx={{fontWeight: "bold"}} >
            Once all the right information have been added. Hit calculate and Analyze your Results!
            </Typography>
          </Grid>
        </Grid>

        <Grid container my={2} rowSpacing={1} columnSpacing={1} textAlign={"Left"} >
        <Grid item sm={12} p={4}> 
        <Button
          onClick={() => navigate("/basic")}
          variant="contained"
          color="secondary"
          textAlign="Right"
          sx={{
          border: "2px solid #F0F0F0",
          fontWeight: "bold",
          marginTop: 2,
          marginBottom: 2,
          width: "25%",
          height: "50px",
          }}
          >
          Calculator
          </Button>
      </Grid>
      </Grid>

      </Box>
    </ThemeProvider>
  );
}
