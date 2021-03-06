CHANGELOG
=========


1.1.1 - 2018-04-11
------------------

* Fixing issue #4: When using a route file that isn't `index.js`, this breaks in Restify.


1.1.0 - 2016-07-21
------------------

This breaks backwards compatibility in an obscure way.  Minor version number increased because of the behavior change.

* Changed parameterized routes so hyphenated parameters are changed to camel case.  For example, `routes/_account-id/index.js` will change into the route `/:accountId/index.js`.


1.0.5 - 2016-05-30
------------------

* Removed a debug line that was foolishly left in the code.


1.0.4 - 2016-05-30
------------------

* Implemented a workaround to [node-restify issue #1115](https://github.com/restify/node-restify/issues/1115).  When dealing with named routes, only the first one is entered with that name.  The rest have a unique, modified name.


1.0.3 - 2016-05-27
------------------

* Corrected ability to have named routes.  This may be Restify-specific, so make sure you know what server you are using before you use the "name" property.


1.0.2 - 2016-04-29
------------------

* Updates from @AbsentSemicolon from a code review.  Thanks!
* No functional changes.


1.0.1 - 2016-04-28
------------------

* Lots of bugfixes.


1.0.0 - 2016-04-28
------------------

* Initial release.
