import { Button, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

const NavigateNextIcon = NavigateNext;


export const BackButton = props => {
    const navigate = useNavigate();

    return (
        <Button
            variant="contained"
            sx={{
                marginLeft: 2,
                width: { xs: "25%", md: "12.5%" },
                height: "50px",
            }}
            onClick={() => navigate(props.path, {
                state: props.state
            })}
        >Back</Button>
    );
};


export const NextButton = props => {
    const navigate = useNavigate();

    return (
        <Button
            variant="contained"
            sx={{
                float: "right",
                marginRight: 2,
                width: { xs: "25%", md: "12.5%" },
                height: "50px",
            }}
            onClick={() => navigate(props.path, {
                state: props.state//{ oat, resType, floorArea }
            })}
            disabled={props.disabled}
        >Next</Button>
    );
};


export const BreadcrumbNav = ({ paths }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const defaultPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Current', path: location.pathname }
    ];

    const breadcrumbPaths = paths || defaultPaths;

    return (
        <Box sx={{ padding: 2, paddingBottom: 0.5 }}>
            <Box
                sx={{
                    padding: 1,
                    display: 'block',
                    alignItems: 'center',
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
                                onClick={() =>
                                    navigate(item.path, {
                                        state: location.state,
                                    })
                                }
                                sx={{
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        color: 'blue'
                                    }
                                }
                                }
                            >
                                {item.name}
                            </Link>
                        )
                    ))}
                </Breadcrumbs>
            </Box>
        </Box>
    );
};
