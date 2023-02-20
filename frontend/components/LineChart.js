import React, { useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart, Line } from 'react-chartjs-2';

const LineChart = React.memo(({ timeserie, clickHandler }) => {
  if (timeserie.length === 0) return;

  useEffect(() => {
    ChartJS.register(
      ...registerables,
      zoomPlugin
    );
  }, []);

  const labels = Object.values(timeserie)[0].map(() => '');
  const datasets = Object.values(timeserie).map((d, i) => {
    return {
      label: `d${i}`,
      data: d.map((v => v)),
      yAxisID: `y`,
      pointRadius: 0,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    colors: {
      enabled: true
    },
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
          drag: {
            enabled: false,
          },
          pinch: {
            enabled: false
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
        display: false,
      },
    },
  };

  return <Line onClick={() => typeof (clickHandler) === 'function' ? clickHandler(timeserie) : null} options={options} data={data} />;
})

export default LineChart;
