import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Unstable_Grid2";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Button, CssBaseline } from "@mui/material";
import { Link, Tab } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function BasicGrid() {
  const [value, setValue] = React.useState("tab-apps");

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
                    >
                      <Tab label="apps" value="tab-apps" />
                      <Tab label="logging" value="tab-logging" />
                      <Tab label="storage" value="tab-storage" />
                      <Tab label="admin" value="tab-admin" />
                    </TabList>
                  </Box>
                  <TabPanel value="tab-apps">Item tab-apps</TabPanel>
                  <TabPanel value="tab-logging">Item Two</TabPanel>
                  <TabPanel value="tab-storage">Item Three</TabPanel>
                  <TabPanel value="tab-admin">Item Four</TabPanel>
                </TabContext>
              </Box>
            </Item>
          </Grid>
          <Grid xs={12}>
            <Item>xs=8</Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
