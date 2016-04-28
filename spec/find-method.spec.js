"use strict";

describe("findMethod", function () {
    var findMethod, serverMock;

    beforeEach(function () {
        findMethod = require("../lib/find-method")();
        serverMock = {
            get: function () {},
            opts: function () {}
        };
    });
    it("uses a known-good method", function () {
        expect(findMethod(serverMock, "get")).toEqual("get");
    });
    it("lowercases the method", function () {
        expect(findMethod(serverMock, "GET")).toEqual("get");
    });
    it("uses a fallback", function () {
        expect(findMethod(serverMock, "options")).toEqual("opts");
    });
    it("lowercases and still uses a fallback", function () {
        expect(findMethod(serverMock, "OPTIONS")).toEqual("opts");
    });
    it("uses a known-pad method", function () {
        expect(findMethod(serverMock, "put")).toEqual(null);
    });
});