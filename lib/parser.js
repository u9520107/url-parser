
/* function parse (path)
 *	@param path the path and query string after the domain and port
 *
 */

var commands = {
	'where': {
		alias: ['where', 'w'],
		encode: 'w',
		type: 'multi'
	}, 
	'count': {
		alias: ['count', 'c'],
		encode: 'c',
		type: 'flag'
	}, 
	'limit': {
		alias: ['limit', 'l'],
		encode: 'l',
		type: 'number'
	}, 
	'orderby': {
		alias: ['orderby', 'order', 'or'],
		encode: 'or',
		type: 'single'
	}, 
	'field': {
		alias: ['field', 'f'],
		encode: 'f',
		type: 'multi'
	}, 
	'groupby': {
		alias: ['groupby', 'group', 'g'],
		encode: 'g',
		type: 'multi'
	}, 
	'offset': {
		alias: ['offset', 'o'],
		encode: 'o',
		type: 'number'	
	}

};
function parse (path) {
	var commands = [];
	if(!path) {
		return commands;
	}
	var resources = path.split('/');
	resources.forEach(function (resource) {
		if(resource==='') {
			return;
		}
		var obj = {};
		if(resource.indexOf('?')>-1) {

			var tokens = resource.split('?');
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
		}
		else {
			obj.name = resource;
		}
		commands.push(obj);
	});
	return commands;
}

function stringify (commands) {
	var resources = [];
	if(!Array.isArray(commands)) {
		throw new Error('commands must be an array');
	}
	commands.forEach(function (command) {
		var tmp = [];	
		for(var key in command) {
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
		tmp = tmp.length > 0 ? ('?'+tmp.join('&')) : '';
		resources.push((command.name ? command.name : '') + tmp);
	});
	return '/' + resources.join('/');
}

function addQuery(obj, name, op) {
	if(!commands.hasOwnProperty(name)) {
		throw new Error(name + ' is not a recognized command');
	}
	var cmd = commands[name];
	switch(cmd.type) {
		case 'multi': 
			if(!Array.isArray(op)) {
			op = op.split(',');
		}
		if(!obj.hasOwnProperty(cmd.encode)) {
			obj[cmd.encode] = op;
		}
		else {
			obj[cmd.encode] =  obj[cmd.encode].concat(op);
		}
		break;
		case 'flag': 
			if(!obj.hasOwnProperty(cmd.encode)) {
			obj[cmd.encode] = true;
		}
		break;
		case 'number': 
			if(isNaN(op)) {
			throw new Error(name + ' expect a number');
		}
		op = parseInt(op);

		if(!obj.hasOwnProperty(cmd.encode)) {
			obj[cmd.encode] = op;
		}
		else {
			obj[cmd.encode][0] = op;
		}
		break;
		default: 
			if(Array.isArray(op) || op.indexOf(',')>-1) {
			throw new Error(name + ' only accept a single value');
		}

		if(!obj.hasOwnProperty(cmd.encode)) {
			obj[cmd.encode] = op;
		}
		else {
			obj[cmd.encode][0] = op;
		}
		break;
	}

}
function getQuery(obj, name) {
	if(!commands.hasOwnProperty(name)) {
		throw new Error(name + ' is not a recognized command');
	}
	var cmd = commands[name];
	switch(cmd.type) {
		case 'multi': 
			if(!obj.hasOwnProperty(cmd.encode)) {
			return '';
		}
		return obj[cmd.encode].join(',');
		case 'flag':
			if(!obj.hasOwnProperty(cmd.encode)) {
			return false;
		}
		return obj[cmd.encode];
		case 'number': 
			if(!obj.hasOwnProperty(cmd.encode)) {
			return null;
		}
		return parseInt(obj[cmd.encode]);
		default:
			if(!obj.hasOwnProperty(cmd.encode)){
			return '';
		}
		return obj[cmd.encode];
	}
}

export {
	parse,
	stringify,
	commands,
	addQuery,
	getQuery
};
