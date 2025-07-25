import {
    Box,
    Grid,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import individualIcon from './images/residential.png';
import aggregatorIcon from './images/aggregator.png';

export default function HouseType() {
    const navigate = useNavigate();

    return (
        <Box sx={{ padding: 3, flex: 1, alignContent: "center" }}>
            <Grid container spacing={6}>
                <Grid item xs={6} align="right">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate("/residential/location", { state: { houseType: "individual" } })}
                        sx={{
                            width: { xs: "100%", md: "50%" },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src={individualIcon}
                            alt="Individual Icon"
                            style={{ maxWidth: "80%", maxHeight: "60%" }}
                        />
                        Individual
                    </Button>
                </Grid>
                <Grid item xs={6} align="left">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate("/residential/location", { state: { houseType: "aggregator" } })}
                        sx={{
                            width: { xs: "100%", md: "50%" },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src={aggregatorIcon}
                            alt="Aggregator Icon"
                            style={{ maxWidth: "80%", maxHeight: "60%" }}
                        />
                        Aggregator
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
};
