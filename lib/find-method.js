"use strict";

module.exports = function () {
    var methodAlternates;

    /**
     * When the method name on the left (the property name) is not defined on
     * the server object, then attempt the method name on the right.  This
     * will keep trying and looping until the method is found or until there
     * are no more maps.
     */
    methodAlternates = {
        "delete": "del",
        "options": "opts"
    };


    /**
     * Determines the server object method name to use.
     * Assigns middleware for a given path and method name.  Does the mapping
     * of method name (HTTP) to the method name (server object).
     *
     * @param {Object} server Has methods for HTTP verbs
     * @param {fileLoader~routeDef} routeDef
     */
    function findMethod(server, method) {
        method = method.toLowerCase();

        while (!server[method] && methodAlternates[method]) {
            method = methodAlternates[method];
        }

        if (!server[method]) {
            method = null;  // Failure
        }

        return method;
    }

    return findMethod;
};
