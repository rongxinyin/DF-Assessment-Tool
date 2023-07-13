import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from '@mui/material/styles';

import TextField from "@mui/material/TextField";
import ButtonGroup from '@mui/material/ButtonGroup';
import { Container } from "@mui/material";
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


// visualization for boxes. will delete later
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));




export default function Advanced() {

  const [age, setAge] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  return (

    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
      <Box gridColumn="span 5" bgcolor="#00303C">
        <ButtonGroup disableElevation variant="contained" aria-label="Disabled elevation buttons">
          <Button>Basic</Button>
          <Button>Advanced</Button>
        </ButtonGroup>

        <h1>Advanced Calculator</h1>

        <p>Building Name</p>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <p>Building Type</p>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Age</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>

          </Grid>
          <Grid item xs={4}>
            <p>Zipcode</p>
            <TextField id="outlined-basic" label="Outlined" variant="outlined" />

          </Grid>
        </Grid>



      </Box>
      <Box gridColumn="span 7">
        <Item>xs=4</Item>
      </Box>
      <Box gridColumn="span 4">
        <Item>xs=4</Item>
      </Box>

    </Box >
  );
}
