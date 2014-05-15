

function parse (url) {
	var commands = [];
	if(!url)
	{
		return commands;
	}
	var resources = url.split('/');
	resources.forEach(function (resource) {
		var tokens = resource.split('?');
		var obj = {
			name: tokens[0]
		};
		tokens = tokens[1].split('&');
		tokens.forEach(function (token) {
			var idx = token.indexOf('=');
			if(idx > -1)
			{
				obj[token.substr(0, idx)] = token.substr(idx+1).split(',');
			}
			else
			{
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
			if(key!=='name')
			{
				if(command[key]===true)
				{
					tmp.push(key);	
				}
				else if(Array.isArray(command[key]))
				{
					tmp.push([key, command[key].join(',')].join('='));
				}
				else
				{
					tmp.push([key, command[key]].join('='));
				}
			}
		}
		resources.push([command.name, tmp.join('&')].join('?'));
	});
	return resources.join('/');
}

export {
	parse,
	stringify
};
