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
    <Box bgcolor="tertiary.main">
      <Box sx={{ flexGrow: 1, margin: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ fontWeight: "bold", marginTop: 3 }}
            >
              About
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{}}>
              Demand Flexibility Assessment Tool (DFAT) is a web-based tool to
              assess the building demand flexibility of small and medium sized
              buildings enabling customers to estimate their demand flexibility
              easily and determine how to reduce their electricity usage in
              response to on-peak expensive electricity prices.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h4" color="primary.main" sx={typographySX}>
              Thanks and Credits
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{}}>
              Main Developers:
            </Typography>
            <ul>
              <Typography variant="h6" color="primary.main">
                - Michael Leong
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{}}>
                - Medha Mahanta
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{}}>
                - Clara Yin
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{}}>
                - TJ Garcia
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{}}>
                - Zach Tan
              </Typography>
            </ul>
            <Typography variant="h6" color="primary.main" sx={{}}>
              And thank you to mentors Rongxin Yin and Anand Krishnan for
              leading this project in the 2023 Experiences in Research program.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ fontWeight: "bold" }}
            >
              Source Code
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{}}>
              The source code for DFAT can be found on{" "}
              <a href="https://github.com/rongxinyin/DR-Estimation-Tool">
                GitHub
              </a>
              .
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
