import { Grid, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';


export const BackButton = props => {
    const navigate = useNavigate();

    return (
        <Box align="left" sx={{ marginTop: "auto", display: { xs: "none", md: "block" } }}>
            <Grid sx={{
                width: "25%"
            }}>
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                        marginTop: 4,
                        marginRight: 2,
                        width: "100%",
                        height: "50px",
                    }}
                    onClick={() => navigate(props.path, {
                        state: props.state
                    })}
                >Back</Button>
            </Grid>
        </Box>
    );
};


export const NextButton = props => {
    const navigate = useNavigate();

    return (
        <Grid container alignItems="center" marginTop="auto">
            <Grid sx={{ marginLeft: "auto", width: "25%" }}>
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                        marginTop: 4,
                        marginRight: 2,
                        width: "100%",
                        height: "50px",
                    }}
                    onClick={() => navigate(props.path, {
                        state: props.state//{ oat, resType, floorArea }
                    })}
                    disabled={props.disabled}
                >Next</Button>
            </Grid>
        </Grid>)
};
