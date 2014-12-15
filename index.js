var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var compileActionscript = require('compile-actionscript');
var chalk = require('chalk');

function fleecyServer(params) {
	params = _.merge({
		port: 3000,
		livereload: true,
		inputPath: 'test/Main.as',
		compilerOptions: {
			'swf-version' : 13,
			'use-gpu' : true,
			'output' : 'test.swf'
		}
	}, params || {});
	var statusSwfParams = _.cloneDeep(params);
	statusSwfParams.inputPath = 'test/Status.as';
	statusSwfParams.compilerOptions.output = 'Status.swf';

	if(!params.compilerOptions.output) params.compilerOptions.output = params.inputPath.replace('.as', '.swf');

	console.log('watching', params.inputPath);
	console.log('compiling', params.inputPath);
	console.log('serving on port:', params.port );

	var connect = require('connect');
	var serveStatic = require('serve-static');
	var app = connect();
	app.use(serveStatic(__dirname + "/tmp"));
	if(params.livereload) {
		app.use(require('connect-livereload')({
			port: 35729
		}));
	}

	function respond(msg) {
		msg = msg || 'hello world';
		return function(req, res) {
			console.log('requesting', req.url);
			if(req.url.indexOf('.swf') != -1) {
				console.log('compiling', req.url);
				function serveThatSwf(swfPath) {
					console.log('compile complete', swfPath);
					var stats;
					try {
						stats = fs.lstatSync(swfPath); // throws if path doesn't exist
					} catch (e) {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.write('404 Not Found\n');
						res.end();
						return;
					}

					if (stats.isFile()) {
						res.writeHead(200, { 'Content-Type': 'application/x-shockwave-flash' });
					    var fileStream = fs.createReadStream(swfPath);
					    fileStream.pipe(res);
					}
				}

				compileActionscript(params.inputPath, params.compilerOptions, function(err) {
					if(err) {
						console.log(chalk.red('COMPILE FAILED!'));
						console.log(chalk.red(err.err));
						console.log(chalk.red(err.stderr));
						var stringContainingNewLines = err.err + err.stdout + err.stderr;
						var htmlString = stringContainingNewLines.replace(/(\r\n|\n|\r)/gm, "<br>")
						htmlString = encodeURI(htmlString);
						statusSwfParams.compilerOptions.defines = {
							'STATUS::log' : htmlString.replace(',', '...')
						}
						compileActionscript(statusSwfParams.inputPath, statusSwfParams.compilerOptions, function() {
							serveThatSwf(statusSwfParams.compilerOptions.output);
						});
					} else {
						serveThatSwf(params.compilerOptions.output)
					}
				});
			} else {
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(msg);
			}
		}
	}

	var html = '<html>' +
	'		<head>' +
	'			<title>Fleecy</title>' +
	'			<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />' +
	'			<script type="text/javascript" src="swfobject.js"></script>' +
	'			<script type="text/javascript">' +
	'			swfobject.embedSWF("' + params.compilerOptions.output + '", "myContent", "100%", "100%", "10.0.0", "expressInstall.swf");' +
	'			</script>' +
	'		</head>' +
	'	<body style="margin: 0px;">' +
	'		<div id="myContent">' +
	'			TEST' +
	'		</div>' +
	'	</body>' +
	'</html>';
	app.use(respond(html));
	app.listen(params.port);
}

module.exports = fleecyServer;