import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";

import {
  styled,
  Box,
  Link,
  Paper,
  Tab,
  CssBaseline,
  Typography,
  Toolbar,
  AppBar,
} from "@mui/material";

import { TabContext, TabList, TabPanel } from "@mui/lab";

import TabMetrics from "./TabMetrics";
import TabConfig from "./TabConfig";
//https://github.com/jdorn/json-editor

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function BasicGrid() {
  const [value, setValue] = React.useState("tab-config");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              color="inherit"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Caddy Mysql Adapter Configuration UI
            </Typography>
            <Link
              href="https://github.com/zhangjiayin/caddy-mysql-adapter"
              target="_blank"
              underline="none"
              color="inherit"
            >
              About
            </Link>
          </Toolbar>
        </AppBar>
      </Box>
      <Box>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <Item>
              <CssBaseline></CssBaseline>
            </Item>
          </Grid>
          <Grid xs={12}>
            <Item>
              <Box sx={{ width: "100%" }}>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                      centered={true}
                    >
                      <Tab label="config" value="tab-config" />
                      <Tab label="metrics" value="tab-metrics" />
                    </TabList>
                  </Box>
                  <TabPanel value="tab-metrics">
                    <TabMetrics />
                  </TabPanel>
                  <TabPanel value="tab-config">
                    <TabConfig />
                  </TabPanel>
                </TabContext>
              </Box>
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
