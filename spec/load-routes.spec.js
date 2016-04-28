"use strict";

describe("loadRoutes", function () {
    var config, findMethodMock, loadRoutes, requireFn, serverMock;

    beforeEach(function () {
        var pathMock;

        findMethodMock = jasmine.createSpy("findMethodMock").andReturn("get");
        pathMock = {
            resolve: function (input) {
                return input;
            },
            sep: "/"
        };
        config = {
            camelCase: "never",
            indexWithSlash: "never",
            routesPath: "./routes/"
        };
        requireFn = jasmine.createSpy("requireFn");
        serverMock = jasmine.createSpyObj("server", [
            "del",
            "get"
        ]);
        loadRoutes= require("../lib/load-routes")(findMethodMock, pathMock, requireFn);
    });
    it("does not load files when passed an empty array", function (done) {
        loadRoutes(serverMock, config, [], function (err) {
            expect(requireFn).not.toHaveBeenCalled();
            done(err);
        });
    });
    it("calls require() for the right number of files", function (done) {
        var required;

        required = [];
        requireFn.andCallFake(function (path) {
            required.push(path);
            return {};
        });
        loadRoutes(serverMock, config, [
            "abc.js",
            "./routes/abc.js"
        ], function (err) {
            expect(required).toEqual([
                "abc.js",
                "./routes/abc.js"
            ]);
            done(err);
        });
    });
    describe("path mapping to URIs", function () {
        function remapRouteDefs(routeDefs) {
            var resultObject;

            resultObject = {};
            routeDefs.forEach(function (routeDef) {
                resultObject[routeDef.uri] = routeDef.middleware[0]();
            });

            return resultObject;
        }

        beforeEach(function () {
            requireFn.andCallFake(function (path) {
                return {
                    get: function () {
                        return path;
                    }
                };
            });
        });
        it("works with no options", function (done) {
            loadRoutes(serverMock, config, [
                "testing.js", // Does not have the path
                "./routes/testing2.js",
                "./routes/index.js",
                "./routes/jelly/index.js"
            ], function (err, routeDefs) {
                expect(remapRouteDefs(routeDefs)).toEqual({
                    "/": "./routes/index.js",
                    "/testing": "testing.js",
                    "/testing2": "./routes/testing2.js",
                    "/jelly": "./routes/jelly/index.js"
                });
                done(err);
            });
        });
        it("applies camelCase", function (done) {
            config.camelCase = "both";
            loadRoutes(serverMock, config, [
                "testing-a-file.js", // Does not have the path
                "./routes/teSTing-2-two.js",
                "./routes/index.js"
            ], function (err, routeDefs) {
                expect(remapRouteDefs(routeDefs)).toEqual({
                    "/": "./routes/index.js",
                    "/testingAFile": "testing-a-file.js",
                    "/testing-a-file": "testing-a-file.js",
                    "/teSTing2Two": "./routes/teSTing-2-two.js",
                    "/teSTing-2-two": "./routes/teSTing-2-two.js"
                });
                done(err);
            });
        });
        it("applies indexWithSlash", function (done) {
            config.indexWithSlash = "both";
            loadRoutes(serverMock, config, [
                "./routes/index.js",
                "./routes/jelly/index.js"
            ], function (err, routeDefs) {
                expect(remapRouteDefs(routeDefs)).toEqual({
                    "/": "./routes/index.js",
                    "/jelly": "./routes/jelly/index.js",
                    "/jelly/": "./routes/jelly/index.js"
                });
                done(err);
            });
        });
        it("parameterizes directories with underscore", function (done) {
            loadRoutes(serverMock, config, [
                "./routes/_x_y/index.js",
                "./routes/account/_id/index.js",
                "./routes/phone/_npa/_nxx/_xxxx/index.js"
            ], function (err, routeDefs) {
                expect(remapRouteDefs(routeDefs)).toEqual({
                    "/:x_y": "./routes/_x_y/index.js",
                    "/account/:id": "./routes/account/_id/index.js",
                    "/phone/:npa/:nxx/:xxxx": "./routes/phone/_npa/_nxx/_xxxx/index.js"
                });
                done(err);
            });
        });
    });
    describe("method names", function () {
        it("errors when you use an undefined method", function (done) {
            findMethodMock.andReturn(null);
            requireFn.andCallFake(function () {
                return {
                    post: function () {
                        return "this method is not implemented by the spy object"
                    }
                };
            });
            loadRoutes(serverMock, config, [
                "test"
            ], function (err) {
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("Could not map method");
                done();
            });
        });
        it("errors when a route file does not export an object nor a function", function (done) {
            loadRoutes(serverMock, config, [
                "test"
            ], function (err) {
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("methods as properties");
                done();
            });
        });
        it("errors when a route file object doesn't assign a function to a method", function (done) {
            requireFn.andCallFake(function () {
                return {
                    get: "abcd"
                };
            });
            loadRoutes(serverMock, config, [
                "test"
            ], function (err) {
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("not a function nor an array");
                done();
            });
        });
        it("errors when a route file exports a function that doesn't return an object", function (done) {
            requireFn.andCallFake(function () {
                return function () {
                    return false;
                };
            });
            loadRoutes(serverMock, config, [
                "test"
            ], function (err) {
                expect(err).toEqual(jasmine.any(Error));
                expect(err.toString()).toContain("methods as properties");
                done();
            });
        });
        it("passes the right information to a factory function", function (done) {
            var calledFactory;

            calledFactory = false;
            config.options = {};
            requireFn.andCallFake(function () {
                return function (server, uriPath, configData) {
                    calledFactory = true;
                    expect(server).toBe(serverMock);
                    expect(uriPath).toBe("/testing");
                    expect(configData).toBe(config.options);

                    return {
                        get: function () {
                            return "factory get";
                        }
                    };
                };
            });
            loadRoutes(serverMock, config, [
                "./routes/testing/index.js"
            ], function (err, routeDefs) {
                expect(calledFactory).toBe(true);
                expect(routeDefs.length).toBe(1);
                expect(routeDefs[0].uri).toBe("/testing");
                expect(routeDefs[0].middleware[0]()).toBe("factory get");
                done(err);
            });
        });
        it("assigns multiple middlewares if the route file exports an array", function (done) {
            var func1, func2;

            func1 = function () {};
            func2 = function () {};
            requireFn.andCallFake(function () {
                return {
                    get: [
                        func1,
                        func2
                    ]
                };
            });
            loadRoutes(serverMock, config, [
                "test"
            ], function (err, routeDefs) {
                expect(routeDefs.length).toBe(1);
                expect(routeDefs[0].middleware.length).toBe(2);
                done(err);
            });
        });
    });
});
