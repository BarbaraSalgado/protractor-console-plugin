'use strict';

module.exports = {

    toEqualEmptyBrowserErrors: function () {
        return {
            compare: function (browserErrors) {
                var result = {
                    pass: true
                };

                if (!browserErrors) {
                    return result;
                }

                var realBrowserErrors = browserErrors.filter(function (error) {
                    return error.level.name === 'SEVERE';
                });

                if (realBrowserErrors.length > 0) {
                    result.pass = false;
                    result.message = "[BROWSER ERRORS] " + realBrowserErrors.length + " error(s).'";

                    realBrowserErrors.forEach(function (error) {
                        result.message += "\n " + JSON.stringify(error, null, 4);
                    });
                }

                return result;
            }
        };
    }
};