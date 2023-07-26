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
    <ThemeProvider theme={theme}>
      <Box bgcolor={"primary.main"} p={2}>
        <Grid
          Container
          my={1}
          width="100%"
          height="100%"
          direction="column"
          justifyContent={"flex-start"}
          alignItems={"flex-start"}
        >
          <Grid item p={2} textAlign={"center"} mb={2} mt={2}>
            <Typography
              mb={2}
              variant="h5"
              color="white.main"
              textAlign={"center"}
              sx={{ fontWeight: "bold" }}
            >
              Calculator Descriptions
            </Typography>
            <Box
              bgcolor="secondary.main"
              p={2}
              sx={{ borderRadius: "5px", border: "2px solid #F0F0F0" }}
            >
              <Typography variant="h6" color="white.main" textAlign={"center"}>
                Basic: The Basic calculator uses building information (such as
                size and build year) and local weather and meter data to
                calculate shed potential for various precool and event
                temperature offsets.<br></br>
                <Typography
                  variant="h6"
                  color="white.main"
                  textAlign={"center"}
                  sx={{ fontWeight: "bold" }}
                >
                  OR
                </Typography>
                Advanced: The Advanced calculator uses information about the
                customer's RTUs, as well as normal and reset temperature
                setpoints, to calculate total demand response load reduction.
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <hr></hr>

        <Grid
          Container
          my={1}
          width="100%"
          height="100%"
          direction="column"
          justifyContent={"flex-start"}
          alignItems={"flex-start"}
        >
          <Grid item sm={12} p={3}>
            <Typography
              variant="h4"
              color="white.main"
              textAlign={"Center"}
              sx={{ fontWeight: "bold" }}
            >
              Basic Guide
            </Typography>
          </Grid>
          <Grid item sm={12} p={1}>
            <Typography
              variant="h5"
              color="white.main"
              textAlign={"left"}
              sx={{ fontWeight: "bold" }}
            >
              Basic User Inputs
            </Typography>
            <Box
              bgcolor="secondary.main"
              p={2}
              sx={{ borderRadius: "5px", border: "2px solid #F0F0F0" }}
            >
              <Typography variant="h6" color="white.main" textAlign={"left"}>
                Start by inputing in your building name and building type.
                Follow that up by adding your building's floor area and height in
                square feet (ft²). Pick which type of HVAC system your builidng
                has (most common is the Package RTU). Find your electrical meter
                (usually found on the outside part of your house) and input the
                peak demand (kW). Finally, input your zipcode and state.
              </Typography>
            </Box>
            <Typography
              mt={3}
              variant="h5"
              color="white.main"
              textAlign={"left"}
              sx={{ fontWeight: "bold" }}
            >
              HVAC Temp DR Shed Capacity Calculation
            </Typography>
            <Box
              bgcolor="secondary.main"
              p={2}
              sx={{ borderRadius: "5px", border: "2px solid #F0F0F0" }}
            >
              <Typography
                variant="h6"
                color="white.main"
                textAlign={"left"}
                sx={{ fontWeight: "bold" }}
              >
                Input the percentage of building floor area that GTA will apply.
                This is how much of your room or building will be affected. Input the precool period temp offset. Finally
                add the demand response temperature offset.
              </Typography>
            </Box>
            <Typography
              mt={3}
              variant="h5"
              color="white.main"
              textAlign={"left"}
              sx={{ fontWeight: "bold" }}
            >
              OAT and kW During the DR Event Hours
            </Typography>
            <Box
              bgcolor="secondary.main"
              p={2}
              sx={{ borderRadius: "5px", border: "2px solid #F0F0F0" }}
            >
              <Typography
                variant="h6"
                color="white.main"
                textAlign={"left"}
                sx={{ fontWeight: "bold" }}
              >
                For this part, input the outside air temperature (OAT)
                and meter kW at that certain hour. For example, first
                hour is 76°F and meter reading is 733 kW. Add these values to
                the input table for all 4 hours.
              </Typography>
            </Box>
            <Typography
              mt={5}
              variant="h5"
              color="white.main"
              textAlign={"Center"}
              sx={{ fontWeight: "bold" }}
            >
              Once all the values have been inputted, click calculate and
              analyze your results!
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          my={2}
          rowSpacing={1}
          columnSpacing={1}
          textAlign={"Left"}
        >
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
