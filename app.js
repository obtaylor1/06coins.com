// cPanel/Passenger convention: keep a root startup file that loads the
// production server bundle. Environment variables are supplied by cPanel.
import "./dist/index.js";
