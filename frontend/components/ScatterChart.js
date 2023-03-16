import React, { useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js/auto';
import { Chart, Scatter } from 'react-chartjs-2';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default function ScattersChart({ data, preds }) {
  if (data.length === 0) return;

  console.log(data);
  useEffect(() => {
    ChartJS.register(
      ...registerables
    );
  }, []);
  
  const labels = data.map(() => '');
  const colors = data.map((v) => getRandomColor());
  const datasets = {
      data: data,
      borderColor: colors,
      backgroundColor: colors,
    };

  const chartData = {
    labels,
    datasets: [datasets],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales: {
      x: {
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      zoom: {
        limits: {
          x: { min: -200, max: 200, minRange: 50 },
          y: { min: -200, max: 200, minRange: 50 }
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          onZoomComplete({ chart }) {
            // This update is needed to display up to date zoom level in the title.
            // Without this, previous zoom level is displayed.
            // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
            chart.update('none');
          }
        }
      },
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
    },
  };

  return <Scatter id='y' options={options} data={chartData} />;
}
