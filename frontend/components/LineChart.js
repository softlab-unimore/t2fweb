import React, { useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart, Line } from 'react-chartjs-2';

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

export default function LineChart({ timeserie }) {
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
            borderColor: getRandomColor(),
            backgroundColor: getRandomColor(),
            yAxisID: `y`
        };
    });

    const data = {
        labels,
        datasets,
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
                  x: {min: -200, max: 200, minRange: 50},
                  y: {min: -200, max: 200, minRange: 50}
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
                  onZoomComplete({chart}) {
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

    return <Line options={options} data={data} />;
}
