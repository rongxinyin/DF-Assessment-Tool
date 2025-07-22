import {
    Box,
    Grid,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import individualIcon from './images/residential.png';
import aggregatorIcon from './images/aggregator.png';

export default () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ padding: 3, height: 'calc(100vh - 90px)' }}>
            <Box sx={{ flexGrow: 1, height: '100%' }}>
                <Grid container spacing={6} sx={{ height: '100%' }} alignItems="center">
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
        </Box>
    )
};
