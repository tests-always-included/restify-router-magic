"use strict";

describe("scanFiles", function () {
    var scanFiles, globMock;

    beforeEach(function () {
        globMock = jasmine.createSpy("glob");
        globMock.sync = jasmine.createSpy("glob.sync");
        scanFiles = require("../lib/scan-files.js")(globMock);
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
    it("operates synchronously", function (done) {
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
            done(err);
        });
    });
});
