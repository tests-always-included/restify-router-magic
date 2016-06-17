"use strict";

describe("scanFiles", function () {
    var fsMock, globMock, scanFiles;

    beforeEach(function () {
        globMock = jasmine.createSpy("glob");
        globMock.sync = jasmine.createSpy("glob.sync");
        fsMock = jasmine.createSpyObj("fs", [
            "access",
            "accessSync"
        ]);
        fsMock.access.andCallFake(function (path, access, callback) {
            callback(null);
        });
        fsMock.R_OK = "R_OK";
        scanFiles = require("../lib/scan-files.js")(fsMock, globMock);
    });
    it("operates asynchronously", function (done) {
        globMock.andCallFake(function (pattern, options, callback) {
            expect(pattern).toBe("./routes/**/*.js");
            expect(options).toEqual({
                nodir: true,
                strict: true
            });
            callback(null, [
                "file1",
                "file2"
            ]);
        });
        scanFiles({
            routesMatch: "**/*.js",
            routesPath: "./routes/",
            sync: false
        }, function (err, fileList) {
            expect(globMock).toHaveBeenCalled();
            expect(globMock.sync).not.toHaveBeenCalled();
            expect(fileList).toEqual([
                "file1",
                "file2"
            ]);
            done(err);
        });
    });
    it("operates synchronously", function () {
        var wasSync;

        wasSync = false;
        globMock.sync.andCallFake(function (pattern, options) {
            expect(pattern).toBe("./routes/**/*.js");
            expect(options).toEqual({
                nodir: true,
                strict: true
            });
            return [
                "file1",
                "file2"
            ];
        });
        scanFiles({
            routesMatch: "**/*.js",
            routesPath: "./routes/",
            sync: true
        }, function (err, fileList) {
            expect(globMock).not.toHaveBeenCalled();
            expect(globMock.sync).toHaveBeenCalled();
            expect(fileList).toEqual([
                "file1",
                "file2"
            ]);
            wasSync = true;
        });
        expect(wasSync).toBe(true);
    });
    it("errors asynchronously if path is wrong", function (done) {
        fsMock.access.andCallFake(function (path, access, callback) {
            callback(new Error("fake error"));
        });
        scanFiles({
            routesMatch: "**/*.js",
            routesPath: "./routes/"
        }, function (err) {
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
    });
    it("errors synchronously if path is wrong", function () {
        var wasSync;

        fsMock.accessSync.andThrow(new Error());
        wasSync = false;
        scanFiles({
            routesMatch: "**/*.js",
            routesPath: "./routes/",
            sync: true
        }, function (err) {
            wasSync = true;
            expect(err).toEqual(jasmine.any(Error))
        });
        expect(wasSync).toBe(true);
    });
});
