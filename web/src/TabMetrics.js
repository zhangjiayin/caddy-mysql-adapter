import * as React from "react";
import * as math from "mathjs";

import { MetricChart } from "./TabMetricsChart";

let mertricInerval = null;
export default class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      frequent: 5,
      error: null,
      isLoaded: false,
      items: [],
      interval: null,
      data: {},
      dataKey: [],
    };
  }

  componentWillUnmount() {
    if (mertricInerval) {
      clearInterval(mertricInerval);
    }
    mertricInerval = null;
  }
  componentDidMount() {
    if (mertricInerval != null) {
      clearInterval(mertricInerval);
    }
    mertricInerval = setInterval(() => {
      fetch("/metrics")
        .then((res) => res.text())
        .then(
          (result) => {
            let lines = result.split("\n").filter((line) => {
              return line.indexOf("#") !== 0;
            });

            if (this.state.dataKey.length === 0) {
              let dataKey = [];
              for (let line of lines) {
                if (line === "") continue;
                dataKey.push(line.split(" ")[0]);
              }
              this.setState({ dataKey: dataKey });
            }

            let data = this.state.data;
            let now = new Date().valueOf();
            for (let line of lines) {
              if (line === "") continue;
              let ts = line.split(" ");
              if (ts[0] in data === false) {
                data[ts[0]] = [];
              }
              data[ts[0]].push([now, math.bignumber(ts[1]).toNumber()]);
              if (data[ts[0]].length > 200) {
                data[ts[0]].shift();
              }
            }
            this.setState({ data: data });
            this.setState({
              isLoaded: true,
            });
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error,
            });
          }
        );
    }, this.state.frequent * 1000);
  }

  render() {
    const { data, dataKey } = this.state;
    return (
      <ul>
        {dataKey.map((item, index) => (
          <li key={index}>
            <MetricChart
              data={data[item]}
              name={item}
              key={"metric_chart_" + index}
            />
          </li>
        ))}
      </ul>
    );
  }
}
