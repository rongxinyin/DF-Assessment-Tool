import React from "react";
import { Chart } from "chart.js/auto";
import { Bar } from "react-chartjs-2";

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

export default BarChart;
