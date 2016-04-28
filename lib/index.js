"use strict";


var configParser, fileLoader, fileScanner, glob, path;

// Node modules, used for injection
glob = require("glob");
path = require("path");

// Our libraries with dependencies injected
findMethod = require("./find-method")();
loadRoutes = require("./file-loader")(findMethod, path, require);
parseConfig= require("./parse-config")(path);
scanFiles = require("./scan-files")(glob);

module.exports = require("./restiry-router-magic")(loadRoutes, parseConfig, scanFiles);