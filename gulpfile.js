var gulp = require('gulp');
var mocha = require('gulp-mocha');
var fs = require('fs');
var path = require('path');
var resolve = require('component-resolver');
var build = require('component-build');
var traceur = require('gulp-traceur');
var through = require('through2');
var gutils = require('gulp-util');
var esprima = require('esprima');

/* task: component-build
 * 1. install components
 * 2. build the output using standalone mode to build/build.js
 *
 */



gulp.task('component-build', function(cb) {
	try {
		resolve(process.cwd(), {
			install: true
		}, function(err, tree) {
			if (err) {
				cb(err);
			}

			var builder = build(tree, {
				standalone: true
			});
			if (!fs.existsSync('build')) {
				fs.mkdirSync('build');
			}
			builder.scripts(function(err, string) {
				if (err) {
					cb(err);
				}
				fs.writeFile(path.resolve('build/parser.js'), string, function(err) {
					cb(err);
				});
			});

		});
	} catch (err) {
		cb(err);
	}
});



// this particular module does not use any es6 features other than component
// which is handled by component-build

/* task: traceur
 * 1. Compile the component built code from es6 syntax javascript
 * 	to es5 compatible javascript in build.es5/ folder.
 */

gulp.task('dist-build', function() {
	return gulp.src('./lib/*.js')
		.pipe(traceur({
			sourceMap: true,
			modules: 'commonjs'
		}))
		.pipe(nodify())
		.pipe(gulp.dest('./dist'));
});

function removeQuote(str) {
	if (str[0] === '"' || str[0] === "'") {
		return str.substr(1, str.length - 2);
	}

	return str;
}

function addQuote(str) {
	return "'" + str + "'";
}
//normalize traceur build for node use
var nodify = function(moduleList) {
	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('nodify', 'Streaming is not supported'));
			return cb();
		}

		moduleList = moduleList || [];

		// we want to change all require('privatemodule') into require('./privatemodule')
		//var content = file.contents.toString();
		var src = file.contents.toString();

		//esprima's currently not able to suppor es6 code with parse feature
		//so here we use the tokenizer to break down the code.
		var ast = esprima.tokenize(src, {
			loc: true,
			range: true,
			raw: true,
			comment: true
		});

		var output = '';
		var lastIdx = 0;
		ast.forEach(function(token, idx) {
			if (token.type === 'Identifier' && token.value === 'require') {
				idx += 2;
				token = ast[idx];
				var moduleName = removeQuote(ast[idx].value);
				if (moduleList.indexOf(moduleName) > -1) {
					//copy from the source and only replace the desired parts
					//so that format is preserved. This way the source-map should be relavent.
					output += src.substring(lastIdx, token.range[0]) + addQuote('./' + moduleName);
					lastIdx = token.range[1];

				} else if (moduleName === 'emitter') {
					output += src.substring(lastIdx, token.range[0]) + addQuote('component-emitter');
					lastIdx = token.range[1];
				}
			} else if (token.type === 'Identifier' && token.value === '$__default') {
				if (ast[idx - 1].value === 'var' &&
					ast[idx + 1].value === '=' &&
					ast[idx + 2].type === 'Identifier') {
					output += src.substring(lastIdx, ast[idx - 1].range[0]);
					output += 'module.exports = ' + ast[idx + 2].value;
					lastIdx = ast[idx + 2].range[1];
				}

			}
		});
		if (lastIdx < src.length) {
			output += src.substr(lastIdx);
		}
		//moduleList.forEach(function (privateModule){
		//	var reg = new RegExp('require\\(\\W*?(\'|")'+privateModule+'(\'|")\\W*?\\)', 'g');
		//	content = content.replace(reg, "require('./" + privateModule + "');");
		//});

		//component's emitter is called 'emitter', while in node it's 'component-emitter'
		//content = content.replace(emitterRegExp, "require('component-emitter')");

		//traceur compiles default module exports to {'default': module} which does
		//not work in node directly. This is easily fixed by overriding module.exports
		//		var matches = defaultRegExp.exec(content);
		//		console.log(matches);
		//		if(matches) {
		//			content= content.substr(0, matches.index)+ '\nmodule.exports = ' + matches[1] + ';\n' + content.substr(matches.index);
		//		}
		file.contents = new Buffer(output);

		this.push(file);
		cb();
	});
};


/* task: mocha
 * 1. Run test suite.
 */
gulp.task('mocha', ['component-build', 'dist-build'], function() {
	return gulp.src('./test/*.js')
		.pipe(mocha({
			reporter: 'list'
		}));
});

/* task: watch
 * 1. monitors source code folders and files and run the build and test
 * 	process.
 */
gulp.task('watch', function() {
	gulp.watch(['component.json', 'lib/**', 'test/**'], ['mocha']);
});



/* default should:
 * 	1. init component install
 * 	2. init initial mocha test
 * 	3. start watching job
 *
 * 	todo: traceur
 */

gulp.task('default', ['mocha', 'watch'], function() {});
