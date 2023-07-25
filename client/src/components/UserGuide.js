import * as React from "react";
import {
  createTheme,
  ThemeProvider, 
  Box,
  Grid, 
  Button,
  ButtonGroup,
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
      <Box bgcolor={"primary.main"} p={2} height="100vh" >
        <Grid Container my={1} width="100%" height="100%" direction="column" justifyContent={"flex-start"} alignItems={"flex-start"}> 

          <Grid item sm={4} p={3} textAlign={"center"} >
          <ButtonGroup
              variant="contained"
              aria-label="Disabled elevation buttons"
              color="secondary"
              sx={{ marginTop: 1}}
            >
          <Button variant="contained" color="secondary" onClick={() => navigate("/UserGuide")}
          sx={{width: "200px",height: "50px", marginTop: 1}}>
          Basic Guide
          </Button>
          <Typography variant="h6" color="white.main" textAlign={"center"} sx={{fontWeight: "bold"}}>
           OR
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate("/UserGuide_Advance")}
          sx={{width: "200px",height: "50px", marginTop: 1}}>
          Advanced Guide
          </Button>
          </ButtonGroup>
          </Grid>

          <Grid item sm={12} p={3}>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", 
            }}>
            <Typography variant="h6" color="white.main" textAlign={"left"} >
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
      </Box>
    </ThemeProvider>
  );
}
