var gulp = require("gulp");
var util = require("gulp-util");
var ts = require("gulp-typescript");
var merge = require('merge2');

var testConsole = {
    errors: 0,
    info: function(msg) { util.log(msg) },
    log: function(msg) { util.log(msg) },
    error: function(msg) {
        util.log(util.colors.red(msg));
        this.errors += 1 },
    hasErrors: function() { return this.errors > 0 }
}

gulp.task("build", function() {
    var tsProject = ts.createProject("src/main/tsconfig.json");
    var tsResult = tsProject.src()
        .pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest("")),
        tsResult.js.pipe(gulp.dest(""))
    ]);
});

gulp.task("test-compile", ["build"], function() {
    var tsProject = ts.createProject("src/test/tsconfig.json");
    var tsResult = tsProject.src()
        .pipe(tsProject());
    return tsResult.js.pipe(gulp.dest(""));
});

gulp.task("test", ["test-compile"], function() {
    var fs = require("fs");

    global.load = function (file) {
        var body = fs.readFileSync(file, {encoding: "utf8"});
        eval.call(global, body);
    };

    load("build/main.js");
    load("lib/UnitTest.js");
    load("build/test.js");

    TestManager.runTests(testConsole);

    if (testConsole.hasErrors()) {
        throw new Error("Some tests failed!");
    }
});

gulp.task("default", ["build", "test"]);