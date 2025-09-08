"use strict";

module.exports = function (fs, glob) {
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
        };

        // Begin the scan
        if (!config.sync) {
            fs.access(config.routesPath, fs.constants.R_OK, function (err) {
                if (err) {
                    callback(err);
                } else {
                    glob.glob(pattern, globOptions).then(
                        (data) => callback(null, data),
                        callback
                    );
                }
            });
        } else {
            err = null;
            files = null;

            try {
                fs.accessSync(config.routesPath, fs.constants.R_OK);
                files = glob.globSync(pattern, globOptions);
            } catch (e) {
                err = e;
            }

            callback(err, files);
        }
    }

    return scanFiles;
};
