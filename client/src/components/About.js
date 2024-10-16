import { Box, Grid, Paper, Typography, styled } from "@mui/material";

// visualization. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function About() {
  return (
    <Box bgcolor="primary.main">
      <Box sx={{ flexGrow: 1, margin: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" color="common.white" sx={{ marginTop: 3 }}>
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
            <Typography variant="h4" color="common.white" sx={{}}>
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
            <Typography variant="h4" color="common.white" sx={{}}>
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
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h4" color="common.white" sx={{}}>
              Paper Citation:
            </Typography>

            <Typography
              variant="body2"
              color="white.main"
              sx={{ fontSize: "1.2rem" }}
            >
              Leong, Michael and Mahanta, Medha and Yin, Clara and Garcia, TJ
              and Tan, Zach and Prakash, Anand K. and Black, Doug and Yin,
              Rongxin, DFAT: A Web-Based Toolkit for Estimating Demand
              Flexibility in Building-to-Grid Integration. Available at SSRN:{" "}
              <a
                href="https://ssrn.com/abstract=4968003"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2196f3" }}
              >
                https://ssrn.com/abstract=4968003{" "}
              </a>
              or{" "}
              <a
                href="http://dx.doi.org/10.2139/ssrn.4968003"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2196f3" }}
              >
                http://dx.doi.org/10.2139/ssrn.4968003{" "}
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
