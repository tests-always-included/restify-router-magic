"use strict";

module.exports = function (loadRoutes, parseConfig, scanFiles) {
    /**
     * Configure the server to have a set of routes that are based on the names
     * of route files.  Methods are defined by the route file contents.
     *
     * @param {Object} server Has methods for HTTP verbs
     * @param {configParser~config} [config] configuration object
     * @param {Function(err)} callback Executed when done searching
     */
    function restifyRouterMagic(server, config, callback) {
        // Config and callback are both optional.  Detect if only config is missing.
        if (typeof config === "function") {
            callback = config;
            config = {};
        }

        if (typeof callback !== "function") {
            callback = function (err) {
                if (err) {
                    throw err;
                }
            };
        }

        // Set default values, validate incoming values
        config = parseConfig(config);
        scanFiles(config, function (err, files) {
            if (err) {
                callback(err);

                return;
            }

            loadRoutes(server, config, files, function (err, routeDefs) {
                if (err) {
                    callback(err);

                    return;
                }

                routeDefs.forEach(function (routeDef) {
                    server[routeDef.serverMethod].apply(server, [
                        routeDef.uri
                    ].concat(routeDef.middleware));
                });

                callback(null);
            });
        });
    }


    return restifyRouterMagic;
};
