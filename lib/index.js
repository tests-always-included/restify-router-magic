"use strict";

var findMethod, fs, glob, loadRoutes, parseConfig, path, scanFiles;

// Node modules, used for injection
fs = require("fs");
glob = require("glob");
path = require("path");

// Our libraries with dependencies injected
findMethod = require("./find-method")();
loadRoutes = require("./load-routes")(findMethod, path, require);
parseConfig= require("./parse-config")(path);
scanFiles = require("./scan-files")(fs, glob);

module.exports = require("./restify-router-magic")(loadRoutes, parseConfig, scanFiles);
