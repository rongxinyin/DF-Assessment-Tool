import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ButtonGroup from '@mui/material/ButtonGroup';
import { Container } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // medium blue
      main: '#007681',
    },
    secondary: {
      // darker blue
      main: '#00303C',
    },
  },
});


export default function Home() {
  return (
    <ThemeProvider theme={theme}>
    <Container maxWidth="xl">
    <div id="Home">
      <div className="basic-calculator">
      <div className="overlap-wrapper">
        <div className="scroll-frame">
            <div className="overlap-group">
              <div className="rectangle" />
              <div className="visualization-area">
                Visualization
                <br />
                Area
              </div>
              <p className="text-wrapper">HVAC Temp Reset DR Shed Estimates (kW) for Peak Temps</p>
            </div>
            <div className="div">
              <div className="text-wrapper-2">Calculator Result area</div>
              <div className="text-wrapper-3">Temperature Range</div>
              <div className="text-wrapper-4">Peak OAT (°F)</div>
              <div className="text-wrapper-5">Estimated kW Shed</div>
            </div>
          </div>
          <div className="top-bar">
          <img
            className="lawrence-berkeley"
            alt="Lawrence berkeley"
            src="lawrence-berkeley-national-laboratory-logo-2.png"
          />
            <div className="navigation">
            <div className="navbar">
              <div className="text-wrapper-26">FAQ</div>
              <div className="text-wrapper-27">User Guide</div>
              <div className="text-wrapper-28">About</div>
              <div className="text-wrapper-29">Calculator</div>
            </div>
          </div>
          </div>
          <div className="dark-background">
            <div className="basic-advanced-buttons">
            <ButtonGroup disableElevation color="primary" variant="contained" aria-label="Disabled elevation buttons">
              <Button>Basic</Button>
              <Button>Advanced</Button>
            </ButtonGroup>
            <h1 className="h-1">Calculator</h1>
          <div className="textAndInput">
            <div className="text-wrapper-9">Building Name
            <br></br>
            <TextField id="filled-basic" label="Enter" variant="filled" color="primary"/></div>
          </div>
          <div className="textAndInput">
            <div className="text-wrapper-10">Building Type
            <br></br>
            <TextField id="filled-basic" label="Dropdown" variant="filled" color="primary"/></div>
          </div>
          <div className="textAndInput">
           <div className="text-wrapper-11">Zipcode
            <br></br>
            <TextField id="filled-basic" label="Enter" variant="filled" color="primary"/></div></div>
          </div>
          <div className="textAndInput">
            <div className="text-wrapper-12">HVAC Type
            <br></br>
            <TextField id="filled-basic" label="Enter" variant="filled" color="primary"/></div>
          </div>
          <div className="text-wrapper-13">15 minute IDAR Meter Data
          <br></br>
          <TextField id="filled-basic" label="Enter" variant="filled" color="primary"/>
          </div>
          <p className="text-wrapper-21">HVAC Temp DR Shed Capacity Calculation</p>
          <p className="p">% of Building Floor Area that Temp Reset will Apply</p>
          <div className="text-wrapper-16"><TextField id="filled-basic" label="0-100" variant="filled" color="primary"/></div>
          <p className="text-wrapper-7">Pre-Cool Period Temp Offset (°F)</p>
          <div className="text-wrapper-14"><TextField id="filled-basic" label="°F" variant="filled" color="primary"/></div>
          <p className="text-wrapper-8">DR Event Period Temp Offset (°F)</p>
          <div className="text-wrapper-15"><TextField id="filled-basic" label="°F" variant="filled" color="primary"/></div>
         
          <p className="reset-download">
            <span className="span">Reset&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <span className="text-wrapper-19">Download </span>
          </p>
          <div className="text-wrapper-20">Calculate</div>
          </div>
          </div>
      </div>
    </div>
    </Container>
    </ThemeProvider>
  );
}
