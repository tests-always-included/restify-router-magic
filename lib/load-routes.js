"use strict";

/**
 * @typedef {Object} fileLoader~routeDef
 * @property {string} filename
 * @property {string} httpMethod The method name from the route file
 * @property {Array.<Function>} middleware
 * @property {string} name
 * @property {string} serverMethod The function to use on server object
 * @property {string} uniqueName
 * @property {string} uri
 */

module.exports = function (findMethod, path, requireFn) {
    /**
     * Converts a filename to a URI path.
     *
     * @param {configParser~config} config configuration object
     * @param {string} filename
     * @return {Array.<string>}
     */
    function filenameToPaths(config, filename) {
        var uriPath;

        // Copy
        uriPath = filename;

        // Standardize the path separator, using a URI path separator
        // Convert to the URI with a leading slash
        uriPath = uriPath.split(path.sep).join("/");

        // Remove index.js from the end
        uriPath = uriPath.replace(/\/index.js$/, "/");

        // Remove the suffix
        uriPath = uriPath.replace(/\.[^./]*$/, "");

        // Remove the path from the beginning
        uriPath = uriPath.replace(config.routesPath, "");

        // Convert to the URI with a leading slash
        uriPath = "/" + uriPath;

        // Parameterize the URI by converting /_ into /:
        // and then change things like :some-id into :someId.
        uriPath = uriPath.split(/\//).map(function (input) {
            if (input && input.length && input.charAt(0) === "_") {
                return input.replace(/^_/, ":").replace(/-./, function (match) {
                    return match.charAt(1).toUpperCase();
                });
            }

            return input;
        }).join("/");

        return pathMangler(config, uriPath);
    }


    /**
     * Loads files as middleware
     *
     * @param {Object} server Has methods for HTTP verbs
     * @param {configParser~config} config configuration object
     * @param {Array.<string>} filenames
     * @param {Function(err,Array.<loadRoutes~routeDef>)} callback Signifies completion
     */
    function loadRoutes(server, config, filenames, callback) {
        var err, result, uniqueNames;

        err = null;
        result = [];
        uniqueNames = {};

        try {
            filenames.forEach(function (filename) {
                filenameToPaths(config, filename).forEach(function (uri) {
                    result = result.concat(moduleLoader(server, config, filename, uri, uniqueNames));
                });
            });
        } catch (e) {
            err = e;
            result = null;
        }

        callback(err, result);
    }


    /**
     * Loads a module for a specific URI.  If the module is a factory function,
     * this is where it gets called.
     *
     * @param {Object} server Has methods for HTTP verbs
     * @param {configParser~config} config configuration object
     * @param {string} filename Route file to load
     * @param {string} uri URI this route file will occupy
     * @param {Object} uniqueNames For tracking a unique name
     * @return {Array.<fileLoader~routeDef>}
     * @throws {Error}
     */
    function moduleLoader(server, config, filename, uri, uniqueNames) {
        var module, name, result;

        module = requireFn(path.resolve(filename));
        result = [];

        if (typeof module === "function") {
            module = module(server, uri, config.options);
        }

        if (typeof module !== "object" || !module) {
            throw new Error("Did not result in an object with methods as properties: " + filename);
        }

        if (module.name) {
            name = module.name;
            delete module.name;
        } else {
            name = null;
        }

        Object.keys(module).forEach(function (methodName) {
            var routeDef, uniqueName;

            // Work around node-restify/issues#1115
            uniqueName = name;
            while (uniqueNames[uniqueName]) {
                uniqueName += "~";
            }
            uniqueNames[uniqueName] = true;

            routeDef = {
                filename: filename,
                httpMethod: methodName,
                middleware: [].concat(module[methodName]),
                name: name,
                serverMethod: findMethod(server, methodName),
                uniqueName: uniqueName,
                uri: uri
            };

            routeDef.middleware.forEach(function (middlewareFn) {
                if (typeof middlewareFn !== "function") {
                    throw new Error("Middleware was not a function nor an array of functions for method: " + routeDef.httpMethod + ", file: " + routeDef.filename);
                }
            });

            // Success - add to the results
            result.push(routeDef);
        });

        return result;
    }


    /**
     * Mangles the path into the ones that are desired by the options.
     *
     * @param {configParser~config} config configuration object
     * @param {string} uri
     * @return {Array.<string>}
     */
    function pathMangler(config, uri) {
        var before, after;

        before = [];

        // Handle camelCase
        if (config.camelCase != "never") {
            // "both" and "force"
            before.push(uri.replace(/-([\w])/g, function (match, p1) {
                return p1.toUpperCase();
            }));
        }

        if (config.camelCase != "force") {
            // "both" and "never"
            if (before.indexOf(uri) === -1) {
                before.push(uri);
            }
        }

        // Now handle indexWithSlash
        after = [];
        before.forEach(function (item) {
            if (item.match(/\/$/)) {
                if (config.indexWithSlash != "never" || item.length == 1) {
                    // "both" and "force"
                    after.push(item);  // Slash should be there automatically
                }

                if (config.indexWithSlash != "force" && item.length > 1) {
                    // "both" and "never"
                    after.push(item.replace(/\/$/, ""));
                }
            } else {
                // Not an index file, won't have the slash at the end
                after.push(item);
            }
        });

        return after;
    }

    return loadRoutes;
};
