import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import residentialIcon from "./images/residential.png";
import commercialIcon from "./images/commercial.png";
import benchmarkIcon from "./images/benchmarking.png";

// Visualization
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function Home() {
  let navigate = useNavigate(); // Navigate to different pages
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if the device is mobile

  return (
    <Box bgcolor={"primary.main"} p={isMobile ? 1 : 2}>
      {" "}
      {/* Adjust padding for mobile */}
      <Grid container spacing={2} padding={isMobile ? 2 : 10} md={12} xs={12}>
        <Grid item xs={12} align="center">
          <Typography
            variant="h4"
            color="white.main"
            sx={{
              fontWeight: "bold",
              marginTop: 10,
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
              m: 1,
              marginTop: 1,
              textAlign: "center",
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
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexDirection: isMobile ? "column" : "row",
          }} /* Stack buttons vertically on mobile */
        >
          {/* Button Components */}
          {/* Residential Button */}
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/residential")}
            sx={{
              width: "350px",
              height: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={residentialIcon}
              alt="Residential Icon"
              style={{ maxWidth: "80%", maxHeight: "60%" }}
            />
            Residential
          </Button>

          {/* Commercial Button */}
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/basic")}
            sx={{
              width: "350px",
              height: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={commercialIcon}
              alt="Commercial Icon"
              style={{ maxWidth: "80%", maxHeight: "60%" }}
            />
            Commercial
          </Button>

          {/* Benchmarking Button */}
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/benchmarking")}
            sx={{
              width: "350px",
              height: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={benchmarkIcon}
              alt="Benchmarking Icon"
              style={{ maxWidth: "80%", maxHeight: "60%" }}
            />
            Benchmarking
          </Button>
        </Grid>

        <Grid
          item
          xs={12}
          align="left"
          sx={{
            marginTop: 5,
            width: "100%",
            backgroundColor: "primary.main",
            fontSize: isMobile
              ? "0.8rem"
              : "1.2rem" /* Adjust font size for mobile */,
          }}
        >
          <Typography
            variant="body2"
            color="white.main"
            sx={{ fontSize: "1.2rem" }}
          >
            Paper Citations:
          </Typography>
          <Typography
            variant="body2"
            color="white.main"
            sx={{ fontSize: "1.2rem" }}
          >
            Yin, R., J. Liu, M.A. Piette, J. Xie, M. Pritoni, A. Casillas, L.
            Yu, P. Schwartz, Comparing simulated demand flexibility against
            actual performance in commercial office buildings, Building and
            Environment, 2023.{" "}
            <a
              href="https://doi.org/10.1016/j.buildenv.2023.110663"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2196f3" }}
            >
              https://doi.org/10.1016/j.buildenv.2023.110663
            </a>
          </Typography>
          <Typography
            variant="body2"
            color="white.main"
            sx={{ fontSize: "1.2rem" }}
          >
            DFAT: A Web-Based Toolkit for Estimating Demand Flexibility in
            Building-to-Grid Integration{" "}
            <a
              href="https://www.softxjournal.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2196f3" }}
            >
              To be submitted to Journal of SoftwareX
            </a>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
