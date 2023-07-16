import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { ReactComponent as Logo } from "./images/lbnlgridintegrationgroup.svg";
import CssBaseline from "@mui/material/CssBaseline";
import graphic from "./images/windmills_grid.jpg"
import { Container, Typography } from "@mui/material";


// visualization. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));



const typographySX = {
  fontWeight: "bold", m: 3
}

export default function About() {
  return (
    <Box sx={{ flexGrow: 1, marginTop: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <Typography
            variant="h4"
            color="primary.main"
            sx={typographySX}
          >Objectives</Typography>
          <Typography
            variant="h6"
            color="primary.main"
            sx={typographySX}>This is a web-based tool to assess the building demand flexibility of small and medium sized buildings enabling
            customers to estimate their demand flexibility easily and determine how to reduce their electricity usage in response to on-peak expensive electricity prices.
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <img src={graphic} style={{ width: 500, height: 250 }}></img>
          {/* <Logo style={{ width: 500, height: 250 }}></Logo> */}
        </Grid>
        <Grid item xs={12} bgcolor="tertiary.main">
          <Typography
            variant="body1"
            color="primary.main"
            sx={typographySX}>The box sat on the desk next to the computer. It had arrived earlier in the day and business had interrupted her opening it earlier. She didn't who had sent it and briefly wondered who it might have been. As she began to unwrap it, she had no idea that opening it would completely change her life.
            The answer was within her reach. It was hidden in a box and now that box sat directly in front of her. She'd spent years searching for it and could hardly believe she'd finally managed to find it. She turned the key to unlock the box and then gently lifted the top. She held her breath in anticipation of finally knowing the answer she had spent so much of her time in search of. As the lid came off she could see that the box was empty.
            A long black shadow slid across the pavement near their feet and the five Venusians, very much startled, looked overhead. They were barely in time to see the huge gray form of the carnivore before it vanished behind a sign atop a nearby building which bore the mystifying information "Pepsi-Cola."
            Finding the truth wouldn't be easy, that's for sure. Then there was the question of whether or not Jane really wanted to know the truth. That's the thing that bothered her most. It wasn't the difficulty of actually finding out what happened that was the obstacle, but having to live with that information once it was found.

          </Typography>

        </Grid>
      </Grid>
    </Box>
  );
}
