// import ReactApexChart from "react-apexcharts";
// import * as React from "react";

import React, { Component } from "react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";

export class MetricChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        title: {
          text: this.props.name,
          align: "left",
        },
        dataLabels: {
          enabled: false,
        },
        // stroke: {
        //   curve: "smooth",
        // },
        legend: {
          show: false,
        },
        markers: {
          size: 0,
        },
        chart: {
          id: "realtime-bar" + this.props.name,
          type: "line",
          animations: {
            enabled: true,
            easing: "linear",
            dynamicAnimation: {
              speed: 1000,
            },
          },
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },
        xaxis: {
          type: "datetime",
          labels: {
            format: "HH:mm:ss",
          },
          categories: [],
        },
      },
      series: [
        {
          name: "series",
          data: [],
        },
      ],
    };
  }

  componentDidUpdate() {
    ApexCharts.exec("realtime-bar" + this.props.name, "updateSeries", [
      {
        data: this.props.data,
      },
    ]);
  }
  render() {
    const { data, name } = this.props;
    let xs = [];
    let ys = [];
    for (let item of data) {
      xs.push(item[0]);
      ys.push(item[1]);
    }
    let options = this.state.options;
    let series = this.state.series;
    series[0].data = ys;
    options.xaxis.categories = xs;
    return (
      <div className="app">
        <div className="row">
          <div className="mixed-chart">
            <Chart options={options} series={series} type="line" />
          </div>
        </div>
      </div>
    );
  }
}
