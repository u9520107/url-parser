
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("url-parser", function (exports, module) {

/* function parse (path)
 *	@param path the path and query string after the domain and port
 *
 */


function parse (path, root) {
	var commands = [];
	if(!path) {
		return commands;
	}
	var resources = path.split('/');
	resources.forEach(function (resource) {
		if(resource=='') {
			return;
		}
		var tokens = resource.split('?');
		var obj = {};
		if(tokens[0]!==''){
			obj.name = tokens[0];
		}
		tokens = tokens[1].split('&');
		tokens.forEach(function (token) {
			var idx = token.indexOf('=');
			if(idx > -1) {
				obj[token.substr(0, idx)] = token.substr(idx+1).split(',');
			}
			else {
				obj[token] = true;
			}
		});		
		commands.push(obj);
	});
	return commands;
}

function stringify (commands) {
	var resources = [];
	if(!Array.isArray(commands))
		{
			throw new Error('commands must be an array');
		}
		commands.forEach(function (command) {
			var tmp = [];	
			for(var key in command)
				{
					if(key!=='name') {
						if(command[key]===true) {
							tmp.push(key);	
						}
						else if(Array.isArray(command[key])) {
							tmp.push(key + '=' + command[key].join(','));
						}
						else {
							tmp.push(key + '=' + command[key]);
						}
					}
				}
				resources.push((command.name ? command.name : '') + '?' +  tmp.join('&'));
		});
		return resources.join('/');
}


module.exports.parse = parse;
module.exports.stringify = stringify;


});

if (typeof exports == "object") {
  module.exports = require("url-parser");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("url-parser"); });
} else {
  this["url-parser"] = require("url-parser");
}
})()
