import { Box, Grid, Paper, Typography, styled } from "@mui/material";
import CitationCompoent from "./CitationComponent.js";

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
        <Box bgcolor="primary.main" sx={{ padding: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h4" color="common.white" sx={{ marginTop: 3 }}>
                            About
                        </Typography>
                        <Typography variant="body1" color="common.white" sx={{}}>
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
                        <Typography variant="body1" color="common.white" sx={{}}>
                            Main Developers:
                        </Typography>
                        <ul>
                            <Typography variant="body1" color="common.white">
                                <li>Michael Leong</li>
                                <li>Medha Mahanta</li>
                                <li>Clara Yin</li>
                                <li>TJ Garcia</li>
                                <li>Zach Tan</li>
                            </Typography>
                        </ul>
                        <Typography variant="body1" color="common.white" sx={{}}>
                            And thank you to mentors Rongxin Yin and Anand Krishnan for
                            leading this project in the 2023 Experiences in Research program.
                        </Typography>
                        <Typography variant="body1" color="common.white" sx={{}}>
                            <a href="https://www.flaticon.com/free-icons/buildings" title="buildings icons" style={{ color: "#2196f3" }} >Buildings icons created by kank - Flaticon</a>
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h4" color="common.white" sx={{}}>
                            Source Code
                        </Typography>
                        <Typography variant="body1" color="common.white" sx={{}}>
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
                            Paper Citation
                        </Typography>
                        <CitationCompoent />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
