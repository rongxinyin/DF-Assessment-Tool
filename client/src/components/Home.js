import { Button, Grid, Container, Typography, createTheme, ThemeProvider} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import image from "./images/berkeleylab.png"; 

const Background = styled("div")({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundImage: `url(${image})`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
});

const theme = createTheme({
  palette: {
    primary: {
      // darker blue
      main: "#00303C",
    },
    secondary: {
      // medium blue
      main: "#007681",
    },
    white: {
      main: "#FFFFFF",
    },
  },

  typography: {
    primary: {
      // white
      main: "#FFFFFF",
    },
    secondary: {
      // medium blue
      main: "#007681",
    },
  },
});

export default function Home() {
  let navigate = useNavigate(); // navigate to diff pages

  return (
    <ThemeProvider theme={theme}>
    return <Background />;
    <Grid 
    container spacing={0}
    width="100%" 
    height="100%"
     marginTop={1}
     item
     md={12}
     xs={12}
    direction="column"
    alignItems="center"
    justifyContent="center"
    >
      <Typography
      variant="h4"
      color="primary.main"
     sx={{ fontWeight: "bold", m: 1, marginTop: 4 }}
      >
      Demand Flexibility Assessment Tool
    </Typography>
    </Grid>
    </ThemeProvider>
  );
}

/*return <Background />;*/
/*<img src={image} style={{ width: "100%", height: "100%" }}></img>*/
