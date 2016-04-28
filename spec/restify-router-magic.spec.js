"use strict";

describe("restifyRouterMagic", function () {
    var loadRoutes, parseConfig, restifyRouterMagic, scanFiles, serverMock;

    beforeEach(function () {
        serverMock = jasmine.createSpyObj("server", [
            "get",
            "post"
        ]);

        // This returns a standardized config object.
        parseConfig = jasmine.createSpy("parseConfig").andCallFake(function (config) {
            return config;
        });

        // Provides a list of files to load
        scanFiles = jasmine.createSpy("scanFiles").andCallFake(function (config, callback) {
            callback(null, [
                "filenames"
            ]);
        });

        // For each file in files, loads the routes
        loadRoutes = jasmine.createSpy("loadRoutes").andCallFake(function (server, config, files, callback) {
            expect(files).toEqual([
                "filenames"
            ]);
            callback(loadRoutes.error, loadRoutes.result);
        });
        loadRoutes.error = null;
        loadRoutes.result = [];
        restifyRouterMagic = require("../lib/restify-router-magic")(loadRoutes, parseConfig, scanFiles);
    });
    it("is an awesome function", function () {
        expect(restifyRouterMagic).toEqual(jasmine.any(Function));
    });
    it("works without a mere config by being nearly omniscient", function (done) {
        restifyRouterMagic(serverMock, function (err) {
            expect(parseConfig).toHaveBeenCalledWith({});
            expect(scanFiles).toHaveBeenCalledWith({}, jasmine.any(Function));
            expect(loadRoutes).toHaveBeenCalledWith(serverMock, {}, [
                "filenames"
            ], jasmine.any(Function));
            done(err);
        });
    });
    it("passes along a real config object", function (done) {
        var config;

        config = {
            real: true
        };
        restifyRouterMagic(serverMock, config, function (err) {
            expect(parseConfig).toHaveBeenCalledWith(config);
            expect(scanFiles).toHaveBeenCalledWith(config, jasmine.any(Function));
            expect(loadRoutes).toHaveBeenCalledWith(serverMock, config, [
                "filenames"
            ], jasmine.any(Function));
            done(err);
        });
    });
    it("reports errors from scanFiles", function (done) {
        var fakeError;

        fakeError = new Error("fake error");
        scanFiles.andCallFake(function (config, callback) {
            callback(fakeError);
        });
        restifyRouterMagic(serverMock, function (err) {
            expect(err).toBe(fakeError);
            expect(loadRoutes).not.toHaveBeenCalled();
            done();
        });
    });
    it("reports errors from loadRoutes", function (done) {
        var fakeError;

        fakeError = new Error("fake error");
        loadRoutes.error = fakeError;
        loadRoutes.result = null;
        restifyRouterMagic(serverMock, function (err) {
            expect(err).toBe(fakeError);
            done();
        });
    });
    it("attaches route definitions", function (done) {
        var mw1, mw2, mw3;

        mw1 = function () {};
        mw2 = function () {};
        mw3 = function () {};
        loadRoutes.result = [
            {
                middleware: [
                    mw1
                ],
                serverMethod: "get",
                uri: "/test1"
            },
            {
                middleware: [
                    mw2,
                    mw3
                ],
                serverMethod: "post",
                uri: "/test2"
            }
        ];
        restifyRouterMagic(serverMock, function (err) {
            expect(serverMock.get).toHaveBeenCalledWith("/test1", mw1);
            expect(serverMock.post).toHaveBeenCalledWith("/test2", mw2, mw3);
            done(err);
        });
    });
});
