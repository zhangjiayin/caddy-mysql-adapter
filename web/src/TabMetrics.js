import * as React from "react";
import * as math from "mathjs";
import {
  Box,
  TextField,
  Stack,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { MetricChart } from "./TabMetricsChart";

let mertricInerval = null;

export default class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.refFrequent = React.createRef();
    this.refMetricUrl = React.createRef();
    this.state = {
      frequent: 5,
      error: null,
      isLoaded: false,
      items: [],
      interval: null,
      data: {},
      dataKeys: [],
      dataKey: "",
      metricUrl: "/metrics",
      age: "",
    };
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.frequent !== this.state.frequent) {
      this.fetchMetricsLoop();
    }
  }
  componentWillUnmount() {
    if (mertricInerval) {
      clearInterval(mertricInerval);
    }
    mertricInerval = null;
  }
  handleIntervalChange(event) {
    this.setState({ frequent: parseInt(event.target.value) });
  }
  handleMetricUrlChange(event) {
    this.setState({ metricUrl: event.target.value });
  }
  handleSelectChange(event) {
    this.setState({ dataKey: event.target.value });
  }
  fetchMetrics() {
    fetch(this.state.metricUrl)
      .then((res) => res.text())
      .then(
        (result) => {
          let lines = result.split("\n").filter((line) => {
            return line.indexOf("#") !== 0;
          });

          if (this.state.dataKeys.length === 0) {
            let dataKeys = [];
            for (let line of lines) {
              if (line === "") continue;
              dataKeys.push(line.split(" ")[0]);
            }
            this.setState({ dataKeys: dataKeys, dataKey: dataKeys[0] });
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
  }

  fetchMetricsLoop() {
    if (mertricInerval != null) {
      clearInterval(mertricInerval);
    }
    mertricInerval = setInterval(
      this.fetchMetrics.bind(this),
      this.state.frequent * 1000
    );
  }
  componentDidMount() {
    this.fetchMetrics();
    this.fetchMetricsLoop.bind(this)();
  }

  render() {
    const { data, dataKeys } = this.state;
    let menuItems = dataKeys.map((item) => (
      <MenuItem value={item} key={"menuItems" + item}>
        {item}
      </MenuItem>
    ));
    let menuSelect = "";
    let metricsChart = "";
    if (menuItems.length > 0) {
      menuSelect = (
        <FormControl sx={{ m: 1, minWidth: 80 }}>
          <InputLabel id="tab-metrics-chart-select-label">Charts</InputLabel>
          <Select
            labelId="tab-metrics-chart-select"
            id="tab-metrics-chart-select"
            value={this.state.dataKey}
            onChange={this.handleSelectChange.bind(this)}
            autoWidth
            label="chart"
          >
            {menuItems}
          </Select>
        </FormControl>
      );
      metricsChart = (
        <MetricChart
          data={data[this.state.dataKey]}
          name={this.state.dataKey}
          key={"tab_metric_chart_" + this.state.dataKey}
        />
      );
    }
    return (
      <Box>
        <Box>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <TextField
              ref={this.refFrequent}
              required
              id="outlined-required"
              label="Fresh Interval in Seconds"
              type="number"
              defaultValue={this.state.frequent}
              onKeyUp={this.handleIntervalChange.bind(this)}
            />
            <TextField
              ref={this.refMetricUrl}
              required
              id="outlined-required"
              label="Request Metrics url"
              defaultValue={this.state.metricUrl}
              onKeyUp={this.handleMetricUrlChange.bind(this)}
            />
            {menuSelect}
          </Stack>
        </Box>
        <Box>{metricsChart}</Box>
      </Box>
    );
  }
}
