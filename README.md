Restify Router Magic
====================

Generate routes from a directory containing your route handlers so you can organize your code.  It also supports dependency injection through factory functions.

This was created for [Restify] because there wasn't a similar module in [npm] yet.  Interestingly, this can be used for Express and other frameworks that employ a `.use()` function, `.METHOD()` style functions, and the same type of middleware (`request`, `response`, and `next` as parameters).


Purpose and Features
--------------------

This library will take the files in a `routes/` folder (configurable) and generate routes automatically.  Routes are able to contain parameters.  These files will define the HTTP method and the handler to use.

To help illustrate the mapping, here are some filenames and routes.  The filename is based on the current working directory when the script is executed.

| Filename                     | Route                            |
|------------------------------|----------------------------------|
| `routes/index.js`            | `/`                              |
| `routes/login.js`            | `/login`                         |
| `routes/status-page.js`      | `/statusPage` and `/status-page` |
| `routes/pets/index.js`       | `/pets` and `/pets/`             |
| `routes/pets/_name/index.js` | `/pets/:name` and `/pets/:name/` |

You will notice that filenames with hyphens turn into both hyphenated and camel case routes.  The same happens for `index.js` - the route can optionally have a trailing slash.  Of course, you can alter the behavior of the library to offer only one version or the other.

In addition to the automatic routing using convention over configuration, this module also supports using factory functions to generate routes.


Example
-------

At its simplest, you need to do only two things.  First, your `app.js`:

    var restify, routerMagic, server;

    restify = require("restify");
    routerMagic = require("routerMagic");
    server = restify.createServer();
    routerMagic(server);  // Note: this is async - more explanation later
    server.listen(8080, function () {
        console.log("Sample application listening on port 8080");
    });

And secondly you will make `routes/index.js`:

    module.exports = {
        get: function (req, res, next) {
            res.send("Hello world!")
            next();
        }
    }

And you're done.  You now have a working example.  If you want to add more routes and complex logic, you simply add more files to `routes/`.

Let's add a more complex route.  In this case we want to use a factory to generate our route because we want to inject additional dependencies into the code and we want to configure how `routerMagic` does its thing.  Alter your `app.js` and change the call to `routerMagic()` to look like this:

    routerMagic(server, {
        // The "options" property is sent into factories
        options: {
            suffix: "This is a suffix"
        }
    });

And now we create `routes/_thing/index.js` with this content:

    // This factory could be called multiple times, depending on
    // the options and the file's name.
    module.exports = function (server, path, options) {
        function getFn(req, res, next) {
            res.send(200, {
                path: path,  // Generated from the file path
                suffix: options.suffix,  // From the "options" property
                thing: req.params.thing  // From the parameterized route
            });
            next();
        }

        return {
            get: getFn
        };
    };

This pattern will let you inject dependencies or even dependency injection containers (like [Dizzy] or [node-di]).  When you start your server and issue a `GET` on `/elephants`, you should see a response similar to this:

    {
        "path": "/_thing",
        "suffix": "This is a suffix",
        "thing": "elephants"
    }


Full API Documentation
======================

`routerMagic(server, [config], [callback])`
-------------------------------------------

* `server` - Instance of a Restify
* `config` - (Optional) An object that adjusts how Restify Magic does its job.
    * `config.camelCase` - (string) Can be `"force"`, `"never"`, or `"both"`.  Determines if route files such as `home-address.js` files should be exposed as routes in camel case.  `"force"` would add a route of `homeAddress`, `"never"` will only add a route with `home-address` as its name, `"both"` will add both styles of routes.  When `"both"` is used, factory functions in route files will be called more than once.  This affects files as well as directories.  Defaults to `"both"` and will throw an `Error` if set to an invalid value.
    * `config.indexWithSlash` - (string) Can be `"force"`, `"never"`, or `"both"`.  Determines if `index.js` files should be exposed as routes with a trailing slash.  `"force"` makes the slash mandatory, `"never"` will only add routes with slashes as the end, `"both"` will add both styles of routes.  When `"both"` is used, factory functions in route files will be called more than once.  Defaults to `"both"` and will throw an `Error` if set to an invalid value.
    * `config.options` - (anything) The value is passed to any factory functions exported by route files.  Defaults to `null`.
    * `config.routesMatch` - (string) Pattern to pass to [glob] for finding what files to load as routes.  The `routesPath` property will be prepended to this value.  Defaults to `"**/*.js"`.
    * `config.routesPath` - (string) Where to scan for route files.  Defaults to `"./routes/"` and will call the callback with an `Error` if this directory does not exist or if no files are found to add to the routes.  This is relative to the process's working directory.
    * `config.sync` - (boolean) Uses synchronous methods instead of asynchronous methods.  Defaults to `false`.
* `callback` - (Optional) A callback to execute when all of the files are loaded.


Route Files
-----------

A route file handles one or more routes.  The simplest form is just exporting an object whose keys are [HTTP methods].  You may use uppercase or lowercase property names.

    // Simple example that illustrates all of the common method names
    module.exports = {
        delete: function (req, res, next) {},
        get: function (req, res, next) {},
        head: function (req, res, next) {},
        options: function (req, res, next) {},
        patch: function (req, res, next) {},
        post: function (req, res, next) {},
        put: function (req, res, next) {}
    }

Note: Instead of using `options` you should probably use [restify.CORS()] instead.

These properties will all map seamlessly to call the server's `.METHOD()` functions.  Both the "delete" and "options" properties will be mapped to `.del()` and `.opts()` for Restify; this mapping is not performed for Express or other servers that object methods that match the HTTP methods.  Please make sure to use HTTP method verbs as property names instead of the method names that are attached to the server object.

There's also a special `name` property that will be used to name the route in Restify.  Do not set this if you are not using Restify.  If you are using Restify, then you don't need to hardcode your routes.  Instead, use Restify's [server.router.render()](http://restify.com/#hypermedia).

    // Route file: city/_name/index.js
    module.exports = {
        get: function (req, res, next) {
            // This requires the queryParser middleware
            res.send("city: " + req.params.city + ", " + req.query.state);
            next();
        },
        name: "city-detail"
    };

    // Route file: city-list.js
    module.exports = function (server, path, options) {
        return {
            get: function (req, res, next) {
                res.send({
                    "Minneapolis": server.router.render("city-detail", {
                        "name": "Minneapolis"
                    }, {
                        "state": "MN"
                    });
                })
            }
        };
    };

    // Result of a GET on /city-list
    {
        "Minneapolis": "/city/Minneapolis?state=MN"
    }

    // Result of a GET on /city/Minneapolis?state=MN"
    city: Minneapolis, MN

Express supports other methods as well.  You're welcome to just add `connect`, `trace`, and all the rest as property names in the exports.  For methods that have a hyphen you will need to quote them, as in `"m-search"`.

Did you want to chain multiple middlewares together?  You can have a property's value be an array of middleware functions instead of just one function.

    // Example of a factory using multiple middlewares for a "GET"
    module.exports = function (server, path, options) {
        return {
            get: [
                options.parseCookiesMiddleware.
                options.ensureLoggedInMiddleware,
                options.validateQueryStringMiddleware,
                function (req, res, next) {
                    res.send("Everything worked");
                    next();
                }
            ]
        };
    };


Future Ideas
============

Let me know if these features would be appealing.

* Ability to show the registered routes.
* Using multiple Router Magic calls and having directories map to different URI base paths.
* Allowing or showing how route files can handle routes that have deeper URIs without making a filesystem structure to match.  This may be an anti-pattern, but I could see some reasons that people would want to support it.
* Serving static files automatically.
* Supporting regular expression routes.  This may be very difficult to represent on a filesystem and I question if there is enough demand for this.


Credits
=======

Inspired by [express-routify](https://github.com/afloyd/express-routify) - This project maps filenames to URI and parameterized routes, which is exactly what we needed.  It also allows a factory function to be exported, which really helped on our projects because we would need a way to inject dependencies or a dependency injection container.

Instead of making the exported function register itself to "/", we preferred to get a result of an object that uses method names as properties, similar to [express-resource](https://github.com/expressjs/express-resource) and roughly like the first level properties in [express-autoroute](https://github.com/stonecircle/express-autoroute).


License
=======

The [MIT License] covers all of this code.  [♥]


[Dizzy]: https://github.com/tests-always-included/dizzy
[Express]: http://expressjs.com/
[HTTP Methods]: https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
[MIT License]: LICENSE.md
[node-di]: https://github.com/vojtajina/node-di
[npm]: https://www.npmjs.com/
[Restify]: http://restify.com/
[restify.CORS()]: http://restify.com/#cors
[♥]: https://www.google.com/search?q=giving+back+to+open+source
