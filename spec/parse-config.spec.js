"use strict";

describe("parseConfig", function () {
    var parseConfig, propertyToTest;

    function allowsValues(property, valueList) {
        valueList.forEach(function (value) {
            it("allows the value: " + value, function () {
                propTester(value, value);
            });
        });
    }

    function propTester(value, expected) {
        var config, result;

        if (expected === undefined) {
            expected = value;
        }

        config = {};
        config[propertyToTest] = value;
        result = parseConfig(config);
        expect(result[propertyToTest]).toBe(expected);

        return result;
    }

    function propTesterError(value, expected) {
        return function () {
            var result;

            result = propTester(value, expected);
            console.error("Did not throw - returned", result);
        };
    }

    beforeEach(function () {
        var pathMock;

        pathMock = {
            delimiter: "/"
        };
        parseConfig= require("../lib/parse-config")(pathMock);
        propertyToTest = null;
    });
    it("exports a function", function () {
        expect(parseConfig).toEqual(jasmine.any(Function));
    });
    it("returns defaults when not passed an object", function () {
        expect(parseConfig()).toEqual({
            camelCase: "both",
            indexWithSlash: "both",
            options: null,
            routesMatch: "**/*.js",
            routesPath: "./routes/",
            sync: false
        });
    });
    describe(".camelCase", function () {
        beforeEach(function () {
            propertyToTest = "camelCase";
        });
        allowsValues("camelCase", [
            "both",
            "force",
            "never"
        ]);
        it("errors when an invalid string value is passed", function () {
            expect(propTesterError("wrong")).toThrow();
        });
        it("errors when a non-string value is passed", function () {
            expect(propTesterError(true)).toThrow();
        });
    });
    describe(".indexWithSlash", function () {
        beforeEach(function () {
            propertyToTest = "indexWithSlash";
        });
        allowsValues("indexWithSlash", [
            "both",
            "force",
            "never"
        ]);
        it("errors when an invalid string value is passed", function () {
            expect(propTesterError("wrong")).toThrow();
        });
        it("errors when a non-string value is passed", function () {
            expect(propTesterError("indexWithSlash", true)).toThrow();
        });
    });
    describe(".options", function () {
        beforeEach(function () {
            propertyToTest = "options";
        });
        it("may be omitted", function () {
            expect(parseConfig({}).options).toEqual(null);
        });
        it("may be set to anything", function () {
            var obj;

            obj = {};
            propTester(obj);
        });
    });
    describe(".routesMatch", function () {
        beforeEach(function () {
            propertyToTest = "routesMatch";
        });
        it("allows any string", function () {
            propTester("asdfasdf");
        });
        it("errors when a non-string value is passed", function () {
            expect(propTesterError([])).toThrow();
        });
    });
    describe(".routesPath", function () {
        beforeEach(function () {
            propertyToTest = "routesPath";
        });
        it("allows any string", function () {
            propTester("asdfasdf/");
        });
        it("forces the path to end in a slash", function () {
            propTester("route-file-location", "route-file-location/");
        });
        it("errors when a non-string value is passed", function () {
            expect(propTesterError([])).toThrow();
        });
    });
    describe(".sync", function () {
        beforeEach(function () {
            propertyToTest = "sync";
        });
        it("can be altered to be on", function () {
            propTester(true);
        });
        it("errors when a non-boolean value is passed", function () {
            expect(propTesterError(1)).toThrow();
        });
    });
});