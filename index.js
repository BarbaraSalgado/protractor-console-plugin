var q = require('q');
var customMatchers = require('./custom-matchers');

/**
 * This plugin checks the browser log after each test for warnings and errors.
 * It can be configured to fail a test if either is detected.  There is also an
 * optional exclude parameter which accepts both regex and strings.  Any log
 * matching the exclude parameter will not fail the test or be logged to the
 * console. A false setting to logWarnings also overrides the failOnWarning setting.
 *
 *    exports.config = {
 *      plugins: [{
 *        path: 'node_modules/protractor/plugins/console',
 *        failOnWarning: {Boolean}                (Default - false),
 *        failOnError: {Boolean}                  (Default - true),
 *        logWarnings: {Boolean}                  (Default - true),
 *        exclude: {Array of strings and regex}   (Default - [])
 *      }]
 *    };
 */
var ConsolePlugin = function () {
    jasmine.addMatchers(customMatchers);
};

/**
 * Gets the browser log.
 *
 * @return {webdriver.promise.Promise.<!Array.<!webdriver.logging.Entry>>}
 */
ConsolePlugin.getBrowserLog = function () {
    return browser.manage().logs().get('browser');
};

/**
 * Logs messages to the test outputl
 *
 * @param {Object} warnings The list of warnings detected by the browser log.
 * @param {Object} errors The list of errors detected by the browser log.
 * @param {boolean} failOnWarning Tests fail if a warning was detected
 * @param {boolean} failOnError Tests fail if an error was detected
 * @param {Object} context The plugin context object
 */
ConsolePlugin.logMessages = function (warnings, errors,
                                      failOnWarning, failOnError, context) {
    warnings.map(function (warning) {
        expect()
        (failOnWarning ? context.addFailure : context.addWarning)(
            warning.level.name + ': ' + warning.message);
    });
    errors.map(function (error) {
        (failOnError ? context.addFailure : context.addWarning)(
            error.level.name + ': ' + error.message);
    });
};

/**
 * Determines if a log message is filtered out or not. This can be set at the
 * config stage using the exclude parameter.  The parameter accepts both strings
 * and regex.
 *
 * @param {string} logMessage Current log message.
 * @return {boolean} true iff the log should be included in the output
 */
ConsolePlugin.includeLog = function (logMessage) {
    return ConsolePlugin.exclude.filter(function (e) {
            return (e instanceof RegExp) ? logMessage.match(e) :
            logMessage.indexOf(e) > -1;
        }).length === 0;
};

/**
 * Parses the log and decides whether to throw an error or not.
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise which resolves when the
 *    logs have been gathered
 */
ConsolePlugin.parseLog = function (context) {
    ConsolePlugin.exclude = context.config.exclude || [];

    return ConsolePlugin.getBrowserLog().then(function (log) {
        return log.filter(function (node) {
            return ConsolePlugin.includeLog(node.message);
        });
    });
};

/**
 * Gather the console logs and output them as test results.  See the
 * documentation of the postTest function in the protractor plugin API.
 *
 * @return {!webdriver.promise.Promise.<Object>} A promise which resolves to the
 *    test results generated by the console logs
 */
ConsolePlugin.prototype.postTest = function () {
    if (this.config.runOnSuites) {
        if (this.config.runOnSuites.indexOf(browser.getProcessedConfig().value_.suite) > -1)
            expect(ConsolePlugin.parseLog(this)).toEqualEmptyBrowserErrors();
    } else {
        expect(ConsolePlugin.parseLog(this)).toEqualEmptyBrowserErrors();
    }
};

var consolePlugin = new ConsolePlugin();

module.exports = consolePlugin;
