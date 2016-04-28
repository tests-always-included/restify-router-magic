"use strict";

module.exports = function (path) {
    /**
     * @typedef {Object} configParser~config
     * @property {("force"|"never"|"both")} camelCase
     * @property {("force"|"never"|"both")} indexWithSlash
     * @property {*} options Passed to the route files that export factories
     * @property {string} routesMatch Pattern used for globbing
     * @property {string} routesPath Where to start searching for files
     * @property {boolean} sync Operate in synchronous mode instead of async
     */


    /**
     * Force a value to be a boolean.
     *
     * @param {*} incoming If it is a boolean use this
     * @param {boolean} def Default value
     * @return {boolean}
     * @throws {Error} Incoming is defined and is not a boolean.
     */
    function boolean(incoming, def) {
        incoming = ifSet(incoming, def);
        guardType(incoming, "boolean")

        return incoming;
    }


    /**
     * Ensures the incoming value is "force", "never" or "both.  Can default to one
     * of those values if incoming is undefined.
     *
     * @param {*} incoming If this validates, use this value
     * @param {boolean} def Default value
     * @return {string} "force", "never" or "both"
     * @throws {Error} Incoming value does not validate.
     */
    function forceNeverBoth(incoming, def) {
        incoming = ifSet(incoming, def);
        guardType(incoming, "string");

        if (incoming === "force" || incoming === "never" || incoming === "both") {
            return incoming;
        }

        throw new Error("Value is not 'force', 'never', nor 'both': " + incoming);
    }


    /**
     * Throw if a value is not of a specific type.
     *
     * @param {*} val
     * @param {string} type
     * @throws {Error} if val is not of the right type
     */
    function guardType(val, type) {
        if (typeof val !== type) {
            throw new Error("Required to use a type of " + type + ", not " + (typeof val));
        }
    }


    /**
     * Use a default value if the incoming value is undefined.
     *
     * @param {*} incoming If it is defined, use this.
     * @param {*} def Default value
     * @return {*}
     */
    function ifSet(incoming, def) {
        if (incoming === undefined) {
            return def;
        }

        return incoming;
    }


    /**
     * Force a value to be a string.
     *
     * @param {*} incoming If it is a string use this
     * @param {string} def Default value
     * @return {string}
     * @throws {Error} Incoming is defined and is not a string.
     */
    function ifString(incoming, def) {
        incoming = ifSet(incoming, def);
        guardType(incoming, "string");

        return incoming;
    }


    /**
     * Parse an incoming config.  If something is set to an invalid type or invalid
     * value, throw an Error.
     *
     * @param {*} incomingConfig Should be an object, but makes allowances if not
     * @return {Object} Config, complete with defaults set.
     * @throws {Error} Invalid types or invalid values
     */
    function parseConfig(incomingConfig) {
        var result;

        if (typeof incomingConfig !== "object" || !incomingConfig) {
            incomingConfig = {};
        }

        result = {
            camelCase: forceNeverBoth(incomingConfig.camelCase, "both"),
            indexWithSlash: forceNeverBoth(incomingConfig.indexWithSlash, "both"),
            options: ifSet(incomingConfig.options, null),
            routesMatch: ifString(incomingConfig.routesMatch, "**/*.js"),
            routesPath: ifString(incomingConfig.routesPath, "./routes/"),
            sync: boolean(incomingConfig.sync, false)
        };

        if (result.routesPath.charAt(result.routesPath.length - 1) !== path.sep) {
            result.routesPath += path.sep;
        }

        return result;
    }


    return parseConfig;
};
