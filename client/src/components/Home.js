import { Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import image from "./images/berkeleylab.png";

export default function Home() {
  let navigate = useNavigate(); // navigate to diff pages

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100vh",
        backgroundImage: `url(${image})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Grid
        container
        spacing={2}
        padding={10}
        md={12}
        xs={12}
        direction="row"
        alignItems="center"
      >
        <Grid item xs={12} align="center">
          <Typography
            variant="h4"
            color="white.main"
            sx={{ fontWeight: "bold", marginTop: 20 }}
          >
            Demand Flexibility Assessment Tool
          </Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <Typography
            variant="h6"
            color="white.main"
            sx={{
              fontWeight: "bold",
              m: 1,
              marginTop: 1,
              textAlign: "center",
            }}
          >
            Welcome to the Demand Flexibility Assessment Tool, made by the Grid
            Integration Group at Lawrence Berkeley National Lab. The estimation
            tool provides demand response shed magnitudes for a range of OATs
            for one of the major DR strategies: HVAC Temp Reset (Precool with
            Zone Temp Setback).
          </Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/basic")}
            sx={{ width: "200px", height: "50px", marginTop: 0 }}
          >
            Estimation Tool
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{
              width: "200px",
              height: "50px",
              marginRight: 0.5,
              marginLeft: 0.5,
            }}
          >
            Benchmarking Tool
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/userguide")}
            sx={{ width: "200px", height: "50px", marginTop: 0 }}
          >
            User Guide
          </Button>
        </Grid>
      </Grid>

      {/* <Grid item xs={4}>
          <Typography
            variant="h6"
            color="white.main"
            sx={{
              fontWeight: "bold",
              m: 1,
              marginTop: 1,
              textAlign: "center",
            }}
          >
            Welcome to the Demand Flexibility Assessment Tool, made by the
            Grid Integration Group at Lawrence Berkeley National Lab. The
            estimation tool provides demand response shed magnitudes for a
            range of OATs for one of the major DR strategies: HVAC Temp Reset
            (Precool with Zone Temp Setback).
          </Typography>
        </Grid>

        <Box sx={{ flexDirection: "row" }}>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/basic")}
                sx={{ width: "200px", height: "50px", marginTop: -30 }}
              >
                Estimation Tool
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="secondary"
                sx={{ width: "200px", height: "50px", marginTop: -30 }}
              >
                Benchmarking Tool
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/userguide")}
                sx={{ width: "200px", height: "50px", marginTop: -30 }}
              >
                User Guide
              </Button>
            </Grid>
          </Grid>
        </Box> */}
    </div>
  );
}

/*return <Background />;*/
/*<img src={image} style={{ width: "100%", height: "100%" }}></img>*/
