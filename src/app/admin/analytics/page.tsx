'use client'
import { Title } from "@/components/Title";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Button, Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import Breadcrumb from "@/components/BreadCrumb";

const Dashboard = () => {
  const { data: session, status } = useSession()
  const bc = [{ label: 'Dashboard'}];


  const [optionsMixedChart, setOptionsMixedChart] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        columnWidth: "50%"
      }
    },
    stroke: {
      width: [4, 0, 0]
    },
    xaxis: {
      categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    markers: {
      size: 6,
      strokeWidth: 3,
      fillOpacity: 0,
      strokeOpacity: 0,
      hover: {
        size: 8
      }
    },
    yaxis: {
      tickAmount: 5,
      min: 0,
      max: 100
    }
  });

  const [seriesMixedChart, setSeriesMixedChart] = useState([
    {
      name: "series-1",
      type: "line",
      data: [30, 40, 25, 50, 49, 21, 70, 51]
    },
    {
      name: "series-2",
      type: "column",
      data: [23, 12, 54, 61, 32, 56, 81, 19]
    },
    {
      name: "series-3",
      type: "column",
      data: [62, 12, 45, 55, 76, 41, 23, 43]
    }
  ]);

  const [optionsRadial, setOptionsRadial] = useState({
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "70%",
          background: "#fff",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24
          }
        },
        track: {
          background: "#fff",
          strokeWidth: "67%",
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35
          }
        },
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -20,
            show: true,
            color: "#888",
            fontSize: "13px"
          },
          value: {
            formatter: function (val:any) {
              return val;
            },
            color: "#111",
            fontSize: "30px",
            show: true
          }
        }
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#ABE5A1"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: "round"
    },
    labels: ["Percent"]
  });

  const [seriesRadial, setSeriesRadial] = useState([76]);

  const [optionsBar, setOptionsBar] = useState({
    chart: {
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      dropShadow: {
        enabled: true
      }
    },
    stroke: {
      width: 0
    },
    xaxis: {
      categories: ["Fav Color"],
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.35,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [90, 0, 100]
      }
    },
    legend: {
      position: "bottom",
      horizontalAlign: "right"
    }
  });

  const [seriesBar, setSeriesBar] = useState([
    {
      name: "blue",
      data: [32]
    },
    {
      name: "green",
      data: [41]
    },
    {
      name: "yellow",
      data: [12]
    },
    {
      name: "red",
      data: [65]
    }
  ]);

  const updateCharts = () => {
    const max = 90;
    const min = 30;
    const newMixedSeries:any = [];
    const newBarSeries:any = [];

    seriesMixedChart.forEach((s) => {
      const data = s.data.map(() => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      });
      newMixedSeries.push({ data: data, type: s.type });
    });

    seriesBar.forEach((s) => {
      const data = s.data.map(() => {
        return Math.floor(Math.random() * (180 - min + 1)) + min;
      });
      newBarSeries.push({ data, name: s.name });
    });

    setSeriesMixedChart(newMixedSeries);
    setSeriesBar(newBarSeries);
    setSeriesRadial([Math.floor(Math.random() * (90 - 50 + 1)) + 50]);
  };

  return (
    <div>
        <Breadcrumb items={bc}/>
        <Title>Dashboard</Title>
        <div className="row mt-5">
         <Card className="col shadow  border-light pt-4  ">
              <CardTitle className="text-center">Employess</CardTitle>
              <CardBody className="text-center">
                  <h1><strong>20</strong></h1>
              </CardBody>
          </Card>
          <Card className="col shadow  border-light pt-4 ms-5 ">
              <CardTitle className="text-center">Teams</CardTitle>
              <CardBody className="text-center">
                  <h1><strong>5</strong></h1>
              </CardBody>
          </Card>
          <Card className="col shadow border-light pt-4 ms-5">
              <CardTitle className="text-center">Reviews</CardTitle>
              <CardBody className="text-center">
                  <h1><strong>15</strong></h1>
              </CardBody>
          </Card>
        </div>
        <div className="row pt-4 mt-4">
          <div className="col shadow pt-4 ">
            <div className="text-center">
              {/* <CardTitle>Mixed Chart</CardTitle> */}
            </div>
                  <Chart
                      options={optionsMixedChart}
                      series={seriesMixedChart}
                      type="line"
                      width="550"
                    /> 
          </div>
          <div className="col shadow pt-4 ms-5 ">
            <div className="text-center">
              {/* <CardTitle>Mixed Chart</CardTitle> */}
            </div>
                  <Chart
                      options={optionsMixedChart}
                      series={seriesMixedChart}
                      type="line"
                      width="550"
                    /> 
          </div>
        </div>
    </div>
  );
};

export default Dashboard;


  