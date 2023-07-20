import React from "react";
import { Chart } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { Typography, Box } from "@mui/material";

const BarChart = (props) => {
  let labels = props.labels;
  let chartTitle = props.chartTitle;
  let data = {
    labels: labels,
    datasets: [
      {
        label: props.dataLabel,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: props.data,
      },
    ],
  };
  return (
    <div>
      <Bar
        data={data}
        options={{
          plugins: {
            title: {
              display: true,
              text: chartTitle,
              font: {
                size: 24,
              },
              align: "center",
            },
          },
        }}
      />
    </div>
  );
};

const createVisualizations = (chartLabels, chartTitle, data) => {
  return (
      <div>
        <Typography
          variant="h5"
          color="primary.main"
          sx={{ fontWeight: "bold", m: 1 }}
        >
          {chartTitle}
        </Typography>
        <Box
          sx={{
            width: 500,
            height: 300,
            backgroundColor: "white.main",
            "&:hover": {
              backgroundColor: "white.main",
              opacity: [0.9, 0.8, 0.7],
            },
            marginTop: 3,
            marginBottom: 3,
          }}
        >
          <BarChart labels={chartLabels} data={data} />
        </Box>{" "}
      </div>
    )
};

export {BarChart, createVisualizations};
