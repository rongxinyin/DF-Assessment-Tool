import React from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import logo from "./favicon.jpeg";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#cde6ef",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.primary,
  borderRadius: 5,
}));

const sampleData = [
  { name: "A", value: 30 },
  { name: "B", value: 45 },
  { name: "C", value: 60 },
  { name: "D", value: 50 },
];

export default function NewResults() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleExport = () => {
    alert("Export feature not implemented yet.");
  };

  return (
    <Box bgcolor="#073a41" minHeight="100vh" p={isMobile ? 2 : 4}>
      {/* Graph Section */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        mt={5}
      >
        <Grid item xs={12} md={5}>
          <Typography 
          variant="h5" 
          sx={{color: "white", mb: 2, fontWeight: "bold", textAlign: "center"}}
          >
            Normal Plot
          </Typography>
          <Item>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sampleData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#007B8A" />
              </LineChart>
            </ResponsiveContainer>
          </Item>
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography 
          variant="h5" 
          sx={{color:"white", mb: 2, fontWeight: "bold", textAlign: "center"}}
          >
            DR Plot
          </Typography>
          <Item>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sampleData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#007B8A" />
              </LineChart>
            </ResponsiveContainer>
          </Item>
        </Grid>
      </Grid>

      {/* Bottom Buttons */}
      <Grid container spacing={2} mt={5} px={isMobile ? 2 : 10}>
        <Grid item>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ backgroundColor: "#cde6ef", color: "black", fontWeight: "bold" }}
          >
            Back
          </Button>
        </Grid>
        <Grid item xs />
        <Grid item>
          <Button
            variant="contained"
            onClick={handleExport}
            sx={{ backgroundColor: "#cde6ef", color: "black", fontWeight: "bold" }}
          >
            Export
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
