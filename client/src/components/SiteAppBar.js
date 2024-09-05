import PropTypes from "prop-types";
import * as React from "react";

import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Logo } from "./images/5_BL_Horiz_Tile_rgb.svg";

const drawerWidth = 240;
const navItems = ["Calculator", "FAQ", "About"];

export default function SiteAppBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Demand Flexibility Assessment Tool
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        position="fixed"
        color="white"
        sx={{ height: 90 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
            {/* <MenuIcon /> */}
          </IconButton>
          <Logo
            onClick={() => navigate("/")}
            style={{ width: 330, height: 90, cursor: "pointer" }}
          ></Logo>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          ></Typography>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              sx={{ color: "primary" }}
              onClick={() => navigate(`/basic`)}
            >
              Calculator
            </Button>
            <Button
              sx={{ color: "primary" }}
              onClick={() => navigate(`/benchmarking`)}
            >
              Benchmarking
            </Button>

            <Button sx={{ color: "primary" }} onClick={() => navigate(`/faq`)}>
              FAQ
            </Button>
            <Button
              sx={{ color: "primary" }}
              onClick={() => navigate(`/about`)}
            >
              About
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}

SiteAppBar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};
