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
      <Box bgcolor={"primary.main"} p={2} >
        <Grid Container my={1} width="100%" height="100%" direction="column" justifyContent={"flex-start"} alignItems={"flex-start"}> 

          <Grid item p={2} textAlign={"center"} mt={2}>
            <ButtonGroup
            variant="contained"
            color="secondary"
            >
            <Button variant="contained" color="secondary" onClick={() => navigate("/UserGuide")}
            sx={{width: "200px",height: "50px", marginTop: 1, }}>
            Basic Guide
            </Button>
            <Typography variant="h6" color="white.main" textAlign={"center"} sx={{fontWeight: "bold"}}>
            <pre> OR </pre>
            </Typography>
            <Button variant="contained" color="secondary" onClick={() => navigate("/UserGuide_Advance")}
          sx={{width: "200px",height: "50px", marginTop: 1}}>
          Advanced Guide
            </Button>
            </ButtonGroup>
          </Grid>

          <Grid item sm={12} p={3} mb={2} >
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
          <Grid item sm={12} p={3} mt={2}>
            <Typography variant="h4" color="white.main" textAlign={"Center"} sx={{fontWeight: "bold"}} >
            Basic Guide
            </Typography>
          </Grid>
          <Grid item sm={12} p={2} >
            <Typography variant="h5" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              Basic User Inputs
            </Typography>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", }}>
            <Typography variant="h6" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              Start by inputing in your building name and building type. Follow that up by adding your buildings floor area and height in square feet (ft²)
            </Typography>
            </Box>
            <Typography mt={3} variant="h5" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              X, Y, & Z
            </Typography>
            <Box bgcolor="secondary.main" p={2}  sx={{ borderRadius: '5px', border: "2px solid #F0F0F0", }}>
            <Typography variant="h6" color="white.main" textAlign={"left"} sx={{fontWeight: "bold"}} >
              Explanation for input x, y, z
            </Typography>
            </Box>
            <Typography mt={5}variant="h5" color="white.main" textAlign={"Center"} sx={{fontWeight: "bold"}} >
            Finally, Hit calculate and Analyze your Results!
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
          Basic calculator
          </Button>
      </Grid>
      </Grid>

      </Box>
    </ThemeProvider>
  );
}
