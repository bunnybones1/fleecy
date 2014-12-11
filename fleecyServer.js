var args = [];
process.argv.forEach(function (val, index, array) {
  args[index] = val;
});

var port = 3000;
var path = require('path');
var as3Path = path.normalize(__dirname + '/' + args[2]);
var as3Root = path.normalize(as3Path + '/' + args[3]);
console.log('watching', as3Path);
console.log('compiling', as3Root);
console.log('serving on port:', port );

var connect = require('connect');
// var serveStatic = require('serve-static');
var app = connect();
// app.use(serveStatic(__dirname + "/tmp"));
app.use(require('connect-livereload')({
	port: 35729
}));

function respond(msg) {
    msg = msg || 'hello world';
    return function(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(msg);
    }
}
app.use(respond());
app.listen(port);
