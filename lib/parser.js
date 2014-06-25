/* function parse (path)
 *	@param path the path and query string after the domain and port
 *
 */


var obj = {
	name: '',
	param: {

		array: [],
		bool: true,
		string: 'string',
		empty: ''
	}
};




function stringify(cmds) {
	if (!Array.isArray(cmds)) {
		cmds = [cmds];
	}
	var resources = [];
	cmds.forEach(function(cmd) {
		var tmp = [];
		var name = cmd.name || '';
		if (cmd.param) {
			for (var key in cmd.param) {
				if (cmd.param[key] === true) {
					tmp.push(key);
				} else if (Array.isArray(cmd.param[key])) {
					tmp.push(key + '[]=' + encodeURIComponent( cmd.param[key].join(',')));
				}
				else {
					tmp.push(key + '=' + encodeURIComponent(cmd.param[key]));
				}
			}
		}
		tmp = tmp.length > 0 ? ('?' + tmp.join('&')) : '';
		resources.push(name + tmp);
	});
	return '/' + resources.join('/');
}

//"/name?w[]=test,dsf&c=teset&d"

function parse(path) {
	console.log('parsing: %s', path);
	var cmds = [];
	if(path) {
		var resources = path.split('/');
		resources.forEach(function (resource) {
			if(resource==='' ) {
				return;
			}
			var cmd = {
				param: {}
			};
			if(resource.indexOf('?') > -1){
				resource = resource.split('?');
				cmd.name = resource[0];
				var params = resource[1].split('&');
				params.forEach(function (param) {
					if(param.indexOf('=')>-1) {
						param = param.split('=');
						if(param[0].indexOf('[]')> - 1) {
							cmd.param[param[0].substring(0, param[0].length -2)] = decodeURIComponent(param[1]).split(',');
						}
						else {
							cmd.param[param[0]] = decodeURIComponent(param[1]);
						}
					}
					else {
						cmd.param[param] = true;
					}
				});
			}
			else {
				cmd.name = resource;
			}
			cmds.push(cmd);
		});
	}
	return cmds;
}



export {
	parse,
	stringify
};
