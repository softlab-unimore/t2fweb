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

export default function ScattersChart({ data, n, clickHandler, timeseries, labels }) {
  if (data.length === 0) return;

  useEffect(() => {
    ChartJS.register(
      ...registerables
    );
  }, []);
  
  const colors = {};
  for (let index = 0; index < n; index++) {
    colors[index] = getRandomColor();
  }

  const datasets = [];

  data.map((v, i) => {
    const dataset = {
      label: 'Cluster ' + v['label'].toString() + ', ' + (labels[i] ? labels[i] : `Timeserie ${i + 1}`),
      data: [{
        x: v['x'],
        y: v['y'],
      }],
      borderColor: colors[v['label']],
      backgroundColor: colors[v['label']],
    };
    datasets.push(dataset);
  });

  const chartData = {
    datasets: datasets,
  };

  const options = {
    onClick: (e, item) => {
      if (item && item[0] !== undefined) {
        const timeserieIndex = item[0]['datasetIndex'];
        const label = labels[timeserieIndex] ? labels[timeserieIndex] : `Timeserie ${timeserieIndex + 1}`;
  
        if (timeseries[timeserieIndex] !== undefined)
          clickHandler(timeseries[timeserieIndex], label, timeserieIndex);
      }
    },
    responsive: true,
    plugins: {
      zoom: {
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
    },
  };

  return <Scatter id='scatter-chart' options={options} data={chartData} />;
}
