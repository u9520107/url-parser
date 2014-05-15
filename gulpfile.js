var gulp = require('gulp');
var mocha = require('gulp-mocha');
var fs = require('fs');
var path = require('path');
var resolve = require('component-resolver');
var build = require('component-build');
var traceur = require('gulp-traceur');

/* task: component-build
 * 1. install components
 * 2. build the output using standalone mode to build/build.js
 *
 */

gulp.task('component-build', function (cb) {
	try
	{
		resolve(process.cwd(), {
			install: true
		}, function (err, tree) {
			if(err)
			{
				cb(err);
			}

			var builder = build(tree, {
				standalone: true
			});
			builder.scripts(function (err, string) {
				if(err)
				{
					cb(err);
				}
				fs.writeFile(path.resolve('parser.js'), string, function (err) {
					cb(err)
				});
			});


		})
	}
	catch (err)
	{
		cb(err);
	}
});

/* task: traceur
 * 1. Compile the component built code from es6 syntax javascript
 * 	to es5 compatible javascript in build.es5/ folder.
 */
gulp.task('traceur', ['component-build'], function () {
	return gulp.src('./build/build.js')
	.pipe(traceur({
		sourceMap: true,
		modules: 'commonjs'
	}))
	.pipe(gulp.dest('./build.es5'));
});
/* task: mocha
 * 1. Run test suite.
 */
gulp.task('mocha', ['component-build'], function () {
	return gulp.src('./test/*.js')
	.pipe(mocha({ reporter: 'list'}));
});

/* task: watch
 * 1. monitors source code folders and files and run the build and test 
 * 	process.
 */
gulp.task('watch', function () {
	gulp.watch([ 'component.json', 'lib/**', 'test/**'], ['mocha']);
});



/* default should:
 * 	1. init component install
 * 	2. init initial mocha test
 * 	3. start watching job
 * 
 * 	todo: traceur
 */

 gulp.task('default', ['mocha', 'watch'],function () {
 });


