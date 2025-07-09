import { Grid, Button, Box , Breadcrumbs, Link, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

const NavigateNextIcon = NavigateNext;


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


export const BreadcrumbNav = ({ paths }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // console.log('Rendering BreadcrumbNav with paths:', JSON.stringify(paths, null, 2));
    // console.log('Current pathname:', location.pathname);
    // console.log('NavigateNextIcon Type:', typeof NavigateNextIcon);
    // console.log('NavigateNextIcon:', NavigateNextIcon);

    const defaultPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Current', path: location.pathname }
    ];

    const breadcrumbPaths = paths || defaultPaths;

    return (
        <Box 
            sx={{ 
                padding: 1, 
                display: 'block',
                alignItems: 'center',
                //border: '1px solid gray',
                zIndex: 10
            }}
        >
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ 
                    '& .MuiBreadcrumbs-separator': { 
                        mx: 0.5 
                    }
                }}
            >
                {breadcrumbPaths.map((item, index) => (
                    index === breadcrumbPaths.length - 1 ? (
                        <Typography 
                            key={item.path} 
                            color="text.primary"
                            sx={{ fontSize: '0.875rem' }}
                        >
                            {item.name}
                        </Typography>
                    ) : (
                        <Link
                            key={item.path}
                            underline="hover"
                            color="inherit"
                            onClick={() => navigate(item.path)}
                            sx={{ 
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                '&:hover': { 
                                    color: 'blue' 
                                }
                            }}
                        >
                            {item.name}
                        </Link>
                    )
                ))}
            </Breadcrumbs>
        </Box>
    );
};