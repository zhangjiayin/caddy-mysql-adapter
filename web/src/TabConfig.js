import * as React from "react";

import { Box, Tab } from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";
// import { JSONEditor } from "@json-editor/json-editor";
// https://github.com/json-editor/json-editor/wiki
//https://github.com/rjsf-team/react-jsonschema-form
// import validator from "@rjsf/validator-ajv8";
// import Form from "@rjsf/core";
import { TabConfigStorage } from "./TabConfigStorage";
import { TabConfigApps } from "./TabConfigApps";
import { TabConfigLogging } from "./TabConfigLogging";
import { TabConfigAdmin } from "./TabConfigAdmin";
export default class TabConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "tab-config-apps",
      config: { admin: {}, apps: {}, logging: {}, storage: {} },
    };
  }
  handleChangeTab(event, tab) {
    this.setState({ tab: tab });
  }
  handleConfigChange(event, config) {
    this.setState({ config: config });
  }

  componentDidMount() {
    fetch("/config/")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({ config: result });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }
  render() {
    return (
      <TabContext value={this.state.tab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={this.handleChangeTab.bind(this)}
            aria-label="lab API tabs example"
            centered={true}
          >
            <Tab label="apps" value="tab-config-apps" />
            <Tab label="logging" value="tab-config-logging" />
            <Tab label="storage" value="tab-config-storage" />
            <Tab label="admin" value="tab-config-admin" />
          </TabList>
        </Box>
        <TabPanel value="tab-config-apps">
          <TabConfigApps config={this.state.config.apps} />
        </TabPanel>
        <TabPanel value="tab-config-logging">
          <TabConfigLogging config={this.state.config.logging} />
        </TabPanel>
        <TabPanel value="tab-config-storage">
          <TabConfigStorage config={this.state.config.storage} />
        </TabPanel>
        <TabPanel value="tab-config-admin">
          <TabConfigAdmin config={this.state.config.admin} />
        </TabPanel>
      </TabContext>
    );
  }
}
