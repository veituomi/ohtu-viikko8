/** Annotates a test class. */
function Testable(target) {
    TestManager.addTestClass(target);
}
/** Annotates a test method. */
function Test(target, propertyKey) {
    TestManager.addTest(target.constructor.name, propertyKey);
}
/** Adds a timeout value in the test method.
 * @param time Time in milliseconds.
*/
function Timeout(time) {
    return function (target, propertyKey) {
        TestManager.addTimeout(target.constructor.name, propertyKey, time);
    };
}
/** Annotates that the test method should throw an exception to work properly. */
function ExpectException(target, propertyKey) {
    TestManager.addException(target.constructor.name, propertyKey);
}
/** Annotates a method that is run every time before a test method. */
function Before(target, propertyKey) {
    TestManager.setBefore(target.constructor.name, propertyKey);
}
/** Annotates a method that is run every time after a test method. */
function After(target, propertyKey) {
    TestManager.setAfter(target.constructor.name, propertyKey);
}
/** Annotates a method that is run once before all test methods. */
function BeforeClass(target, propertyKey) {
    TestManager.setBeforeClass(target.constructor.name, propertyKey);
}
/** Annotates a method that is run once after all test methods. */
function AfterClass(target, propertyKey) {
    TestManager.setAfterClass(target.constructor.name, propertyKey);
}
/** Annotates that the method is ignored when running tests. */
function Ignore(target, propertyKey) {
    //console.log(propertyKey + " was ignored.");
}
/** @internal */
var DefaultConsole = (function () {
    function DefaultConsole() {
        /** @internal */
        this.errors = 0;
    }
    DefaultConsole.prototype.info = function (message) {
        console.info(message);
    };
    DefaultConsole.prototype.log = function (message) {
        console.log(message);
    };
    DefaultConsole.prototype.error = function (message) {
        console.error(message);
        this.errors += 1;
    };
    DefaultConsole.prototype.hasErrors = function () {
        return this.errors > 0;
    };
    return DefaultConsole;
}());
/** @internal */
var TestCase = (function () {
    function TestCase() {
        this.exceptions = new Array();
        this.tests = new Array();
        this.timeouts = {};
    }
    TestCase.prototype.addTest = function (method) {
        this.tests.push(method);
    };
    TestCase.prototype.addTimeout = function (method, time) {
        this.timeouts[method] = time;
    };
    TestCase.prototype.addException = function (method) {
        this.exceptions[method] = true;
    };
    TestCase.prototype.getException = function (method) {
        return this.exceptions[method] === true;
    };
    TestCase.prototype.getTests = function () {
        return this.tests;
    };
    TestCase.prototype.getTimeout = function (method) {
        if (this.timeouts && this.timeouts[method])
            return this.timeouts[method];
        return -1;
    };
    return TestCase;
}());
/** @internal */
var TestManager = (function () {
    function TestManager() {
    }
    TestManager.addTestClass = function (target) {
        this.testClasses.push(target);
    };
    TestManager.addTest = function (target, method) {
        this.checkExists(target);
        this.testCases[target].addTest(method);
    };
    TestManager.addTimeout = function (target, method, time) {
        this.checkExists(target);
        this.testCases[target].addTimeout(method, time);
    };
    TestManager.addException = function (target, method) {
        this.checkExists(target);
        this.testCases[target].addException(method);
    };
    TestManager.setBefore = function (target, method) {
        this.checkExists(target);
        this.testCases[target].before = method;
    };
    TestManager.setAfter = function (target, method) {
        this.checkExists(target);
        this.testCases[target].after = method;
    };
    TestManager.setBeforeClass = function (target, method) {
        this.checkExists(target);
        this.testCases[target].beforeClass = method;
    };
    TestManager.setAfterClass = function (target, method) {
        this.checkExists(target);
        this.testCases[target].afterClass = method;
    };
    /** @internal */
    TestManager.checkExists = function (target) {
        if (this.testCases[target])
            return;
        this.testCases[target] = new TestCase();
    };
    TestManager.runTests = function (testConsole) {
        for (var _i = 0, _a = this.testClasses; _i < _a.length; _i++) {
            var target = _a[_i];
            if (this.testCases[target.name]) {
                var test = new target(target.name, this.testCases[target.name], testConsole);
            }
        }
    };
    return TestManager;
}());
TestManager.testClasses = new Array();
TestManager.testCases = {};
var UnitTest = (function () {
    /** @internal */
    function UnitTest(n, t, c) {
        this.passed = 0;
        this.failed = 0;
        this.name = n;
        this.testCase = t;
        this.console = c;
        this.run();
    }
    /** @internal */
    UnitTest.prototype.run = function () {
        this.invokeMethod(this.testCase.beforeClass);
        for (var _i = 0, _a = this.testCase.getTests(); _i < _a.length; _i++) {
            var method = _a[_i];
            this.invokeMethod(this.testCase.before);
            var timeBefore = new Date();
            this.invokeMethod(method);
            var time = this.testCase.getTimeout(method);
            if (time > 0 && new Date(Date.now() - time) > timeBefore)
                this.fail(method + " took too long.");
            this.invokeMethod(this.testCase.after);
        }
        this.invokeMethod(this.testCase.afterClass);
        this.console.info(this.name + ": " + this.passed + "/" + (this.passed + this.failed));
    };
    /** @internal */
    UnitTest.prototype.invokeMethod = function (method) {
        if (typeof this[method] != "function")
            return;
        this.method = method;
        try {
            this[method]();
        }
        catch (ex) {
            this.requireTrue("Test caused an unexpected exception.", this.testCase.getException(method));
            return;
        }
        if (this.testCase.getException(method)) {
            this.fail("Exception was expected but not thrown.");
        }
    };
    /** @internal */
    UnitTest.prototype.requireTrue = function (message, condition) {
        if (condition) {
            this.passed++;
        }
        else {
            this.console.error(message);
            this.failed++;
        }
    };
    UnitTest.prototype.fail = function (message) {
        this.requireTrue(message, false);
    };
    UnitTest.prototype.assertTrue = function (message, condition) {
        this.requireTrue(message, condition);
    };
    UnitTest.prototype.assertFalse = function (message, condition) {
        this.requireTrue(message, !condition);
    };
    UnitTest.prototype.assertEquals = function (message, expected, actual, tolerance) {
        if (tolerance != undefined) {
            this.requireTrue(message, Math.abs(expected - actual) < tolerance);
        }
        else {
            this.requireTrue(message, expected == actual);
        }
    };
    UnitTest.prototype.assertNull = function (message, object) {
        this.requireTrue(message, object == null);
    };
    UnitTest.prototype.assertNotNull = function (message, object) {
        this.requireTrue(message, object != null);
    };
    UnitTest.prototype.assertSame = function (message, expected, actual) {
        this.requireTrue(message, expected == actual);
    };
    UnitTest.prototype.assertNotSame = function (message, expected, actual) {
        this.requireTrue(message, expected != actual);
    };
    return UnitTest;
}());
