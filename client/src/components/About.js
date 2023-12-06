import { Box, Grid, Paper, Typography, styled } from "@mui/material";
import graphic from "./images/windmills_grid.jpg";

// visualization. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const typographySX = {
  fontWeight: "bold",
  m: 0,
};

export default function About() {
  return (
    <Box bgcolor="primary.main">
      <Box sx={{ flexGrow: 1, margin: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              color="common.white"
              sx={{ fontWeight: "bold", marginTop: 3 }}
            >
              About
            </Typography>
            <Typography variant="h6" color="common.white" sx={{}}>
              Demand Flexibility Assessment Tool (DFAT) is a web-based tool to
              assess the building demand flexibility of small and medium sized
              buildings enabling customers to estimate their demand flexibility
              easily and determine how to reduce their electricity usage in
              response to on-peak expensive electricity prices.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h4" color="common.white" sx={typographySX}>
              Thanks and Credits
            </Typography>
            <Typography variant="h6" color="common.white" sx={{}}>
              Main Developers:
            </Typography>
            <ul>
              <Typography variant="h6" color="common.white">
                - Michael Leong
              </Typography>
              <Typography variant="h6" color="common.white" sx={{}}>
                - Medha Mahanta
              </Typography>
              <Typography variant="h6" color="common.white" sx={{}}>
                - Clara Yin
              </Typography>
              <Typography variant="h6" color="common.white" sx={{}}>
                - TJ Garcia
              </Typography>
              <Typography variant="h6" color="common.white" sx={{}}>
                - Zach Tan
              </Typography>
            </ul>
            <Typography variant="h6" color="common.white" sx={{}}>
              And thank you to mentors Rongxin Yin and Anand Krishnan for
              leading this project in the 2023 Experiences in Research program.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h4"
              color="common.white"
              sx={{ fontWeight: "bold" }}
            >
              Source Code
            </Typography>
            <Typography variant="h6" color="common.white" sx={{}}>
              The source code for DFAT can be found on{" "}
              <a
                style={{ color: "#2196f3" }} // Inline styling
                href="https://github.com/rongxinyin/DR-Estimation-Tool"
              >
                GitHub
              </a>
              .
            </Typography>

            <Typography variant="h6" color="common.white" sx={{}}>
              Paper citation: DFAT: A Web-Based Demand Flexibility Assessment
              Toolkit for Building-to-Grid Integration. {" "}
              <a
                href="https://doi.org/10.1016/j.buildenv.2023.110663"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2196f3" }} // Inline styling
              >
                To be submitted to Journal of SoftwareX
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
