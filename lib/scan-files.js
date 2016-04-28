"use strict";


module.exports = function (glob) {
    /**
     * Scan for files that match the specifications in the configuration.
     *
     * Uses node-glob for the real hard work.
     *
     * @param {configParser~config} config
     * @param {Function} callback
     */
    function scanFiles(config, callback) {
        var err, files, globOptions, pattern;

        pattern = config.routesPath + config.routesMatch;

        globOptions = {
            nodir: true, // Only match files
            strict: true // Force errors to show up when there are problems reading directories
        };

        // Begin the scan
        if (!config.sync) {
            glob(pattern, globOptions, callback);
        } else {
            err = null;
            files = null;

            try {
                files = glob.sync(pattern, globOptions);
            } catch (e) {
                err = e;
            }

            callback(err, files);
        }
    }


    return scanFiles;
};
