import { Box, Button, Grid, Typography, Paper, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import image from "./images/berkeleylab.png";
import residentialIcon from "./images/residential.png";
import commercialIcon from "./images/commercial.png";
import benchmarkIcon from "./images/benchmarking.png";

// visualization
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function Home() {
  let navigate = useNavigate(); // navigate to diff pages

  return (
    <Box bgcolor={"primary.main"} p={2}>
      <Grid
        container
        spacing={2}
        padding={10}
        md={12}
        xs={12}
        //direction="row"
        //alignItems="center"
      >
        <Grid item xs={12} align="center">
          <Typography
            variant="h4"
            color="white.main"
            sx={{
              fontWeight: "bold",
              marginTop: 10,
              // textShadow: "2px 2px #000",
            }}
          >
            Welcome to the Demand Flexibility Assessment Tool (DFAT)
          </Typography>
        </Grid>

        <Grid item xs={12} align="center">
          <Typography
            variant="h6"
            color="white.main"
            sx={{
              // fontWeight: "bold",
              m: 1,
              marginTop: 1,
              textAlign: "center",
              // backgroundColor: "tertiary.main", // Change the background color to theme primary
              // textShadow: "1px 1px #000",
            }}
          >
            DFAT is an open-source web-based tool that estimates the demand
            flexibility potential of common control strategies in residential
            and commercial buildings. DFAT is designed to help building owners &
            operators understand the potential of demand flexibility in their
            buildings and to help utilities and grid operators understand the
            potential of demand flexibility in their service territories.
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          align="center"
          sx={{ display: "flex", justifyContent: "center", gap: "1rem" }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/residential")}
            sx={{
              width: "250px",
              height: "120px", // Increase the height of the button area
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={residentialIcon}
              alt="Residential Icon"
              style={{ maxWidth: "80%", maxHeight: "60%" }} // Reduce the image size to fit into the button area
            />
            Residential
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/basic")}
            sx={{
              width: "250px",
              height: "120px", // Increase the height of the button area
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={commercialIcon}
              alt="Commercial Icon"
              style={{ maxWidth: "80%", maxHeight: "60%" }} // Reduce the image size to fit into the button area
            />
            Commercial
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/benchmarking")}
            sx={{
              width: "250px",
              height: "120px", // Increase the height of the button area
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={benchmarkIcon}
              alt="Benchmarking Icon"
              style={{ maxWidth: "80%", maxHeight: "60%" }} // Reduce the image size to fit into the button area
            />
            Benchmarking
          </Button>
        </Grid>

        <Grid
          item
          xs={12}
          align="left"
          sx={{
            top: "auto", // Change top to "auto" to move the grid to the bottom of the box
            bottom: 0, // Set bottom to 0 to align the grid to the bottom
            display: "flex",
            alignItems: "center",
            marginTop: 20,
            width: "100%", // Set the width to 100%
            backgroundColor: "primary.main", // Change the background color to theme primary
          }}
        >
          <Typography
            variant="body2"
            color="white.main"
            sx={{ fontSize: "1.2rem" }}
          >
            {" "}
            Paper citation: DFAT: A Web-Based Demand Flexibility Assessment
            Toolkit for Building-to-Grid Integration,{" "}
            <a
              href="https://doi.org/10.1016/j.buildenv.2023.110663"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white.main" }}
            >
              https://doi.org/10.1016/j.buildenv.2023.110663
            </a>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
