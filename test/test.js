
var should = require('should');
var path = require('path');
var parser = require(path.resolve('./parser'));

describe('parser', function () {
	var input = '/resource?where=id:34452/?where=age>18&count';
	var output = [
		{
		name: 'resource',
		where: ['id:34452']
	},
	{
		where: ['age>18'],
		count: true
	}
	];

	it('should have function [parse]', function () {
		parser.should.have.property('parse');
		parser.parse.should.be.type('function');
	});
	it('should parse empty string', function () {
		parser.parse('').should.eql([]);
	});
	it('should parse root path', function () {
		parser.parse('/').should.eql([]);
	});
	it('should stringify empty command into root path', function () {
		parser.stringify([]).should.eql('/');
	});
	it('should parse single resource requests without leading \'/\'', function () {
		parser.parse('test').should.eql([{name:'test'}]);
	});
	it('should parse single resource requests with leading \'/\'', function () {
		parser.parse('/test').should.eql([{name:'test'}]);
	});
	it('should stringify single resource requests with leading \'/\'', function () {
		parser.stringify(parser.parse('test')).should.eql('/test');
	});
	it('should parse "' + input + '" into "'+ JSON.stringify(output) + '"'  , function () {
		parser.parse(input).should.eql(output);
	});

	it('should have function [stringify]', function () {
		parser.should.have.property('stringify');
		parser.stringify.should.be.type('function');
		describe('stringify', function () {
			it('should stringify parsed input back to input string', function () {
				parser.stringify(parser.parse(input)).should.eql(input);
			});
			it('parses and stringifies "' + input + '" for 10000 times', function () {
				for(var i = 0; i<10000; i++)
				{
					parser.stringify(parser.parse(input));
				}
			});
		});
	});
});
