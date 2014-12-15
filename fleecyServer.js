
var childProcess = require('child_process');
var flexOptions = require('./flexOptions');
var flexSdk = require('flex-sdk');
var args = [];
process.argv.forEach(function (val, index, array) {
  args[index] = val;
});

var port = 3000;
var path = require('path');
var as3Path = path.normalize(__dirname + '/' + args[2]);
var as3Root = path.normalize(as3Path + '/' + args[3]);
var as3Root = path.normalize(as3Path + '/' + args[3]);
var swfFileName = args[3].replace('.as', '.swf');
console.log('watching', as3Path);
console.log('compiling', as3Root);
console.log('serving on port:', port );

var connect = require('connect');
var serveStatic = require('serve-static');
var app = connect();
app.use(serveStatic(__dirname + "/tmp"));
app.use(require('connect-livereload')({
	port: 35729
}));

function respond(msg) {
	msg = msg || 'hello world';
	return function(req, res) {
		console.log('requesting', req.url);
		if(req.url.indexOf('.swf') != -1) {
			console.log('compiling', req.url);

			var cmdLineOpts = flexOptions.toCommandLineFormat(flexOptions.getDefaults());
			console.log(cmdLineOpts);
			// Compile!
			childProcess.execFile(flexSdk.bin.mxmlc, cmdLineOpts, function(err, stdout, stderr) {
				// TODO: Probably want to do something more here...? Not positive yet.
				if (!err) {
					console.log('File "' + swfFileName + '" created.');
				} else {
					console.log(err);
				}
				console.log(stderr);
				console.log(stdout);
				console.log('compile complete', swfFileName);
				res.writeHead(200, { 'Content-Type': 'application/x-shockwave-flash' });
				res.end(msg);
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
'			swfobject.embedSWF("' + swfFileName + '", "myContent", "100%", "100%", "10.0.0", "expressInstall.swf");' +
'			</script>' +
'		</head>' +
'	<body>' +
'		<div id="myContent">' +
'			TEST' +
'		</div>' +
'	</body>' +
'</html>';
app.use(respond(html));
app.listen(port);
