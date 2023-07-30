import {
  Button,
  Grid,
  Container,
  Typography,
  createTheme,
  ThemeProvider,
  Box,
  Toolbar,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import image from "./images/berkeleylab.png";

const Background = styled("div")({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundImage: `url(${image})`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
});

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
      main: "#FFFFFF",
    },
  },

  typography: {
    primary: {
      // white
      main: "#FFFFFF",
    },
    secondary: {
      // medium blue
      main: "#007681",
    },
  },
});

export default function Home() {
  let navigate = useNavigate(); // navigate to diff pages

  return (
    <div style={{ backgroundImage: `url(${image})`, height: "100vh" }}>
      <ThemeProvider theme={theme}>
        <Grid
          container
          spacing={2}
          width="100%"
          height="100%"
          padding={10}
          item
          md={12}
          xs={12}
          direction="column"
          alignItems="center"
        >
          <Typography
            variant="h4"
            color="white.main"
            sx={{ fontWeight: "bold", marginTop: 4 }}
          >
            Demand Flexibility Assessment Tool
          </Typography>
          <Grid item xs={4}>
            <Typography
              variant="h6"
              color="white.main"
              sx={{
                fontWeight: "bold",
                m: 1,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Welcome to the Demand Flexibility Assessment Tool, made by the
              Grid Integration Group at Lawrence Berkeley National Lab. The
              estimation tool provides demand response shed magnitudes for a
              range of OATs for one of the major DR strategies: Global Temperature Adjustment
              (Precool with Zone Temp Setback).
            </Typography>
          </Grid>

          <Box sx={{ flexDirection: "row" }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate("/basic")}
                  sx={{ width: "200px", height: "50px", marginTop: 5 }}
                >
                  Estimation Tool
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ width: "200px", height: "50px", marginTop: 5 }}
                >
                  Benchmarking Tool
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate("/userguide")}
                  sx={{ width: "200px", height: "50px", marginTop: 5 }}
                >
                  User Guide
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </ThemeProvider>
    </div>
  );
}

/*return <Background />;*/
/*<img src={image} style={{ width: "100%", height: "100%" }}></img>*/
