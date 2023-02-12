import * as React from "react";

import { Box, Tab } from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";

export default function TabConfig() {
  const [value, setValue] = React.useState("tab-config-apps");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList
          onChange={handleChange}
          aria-label="lab API tabs example"
          centered={true}
        >
          <Tab label="apps" value="tab-config-apps" />
          <Tab label="logging" value="tab-config-logging" />
          <Tab label="storage" value="tab-config-storage" />
          <Tab label="admin" value="tab-config-admin" />
        </TabList>
      </Box>
      <TabPanel value="tab-config-apps">Item tab-apps</TabPanel>
      <TabPanel value="tab-config-logging">Item Two</TabPanel>
      <TabPanel value="tab-config-storage">Item Three</TabPanel>
      <TabPanel value="tab-config-admin">Item Four</TabPanel>
    </TabContext>
  );
}
