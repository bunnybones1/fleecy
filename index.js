var path = require('path');
var forever = require('forever-monitor');
function fleecy(as3Path, as3Root) {

	var child = new (forever.Monitor)('./fleecyServer.js', {
		max: 1,
		silent: false,
		args: [as3Path, as3Root]
	});


	child.on('watch:restart', function(info) {
	    console.error('Restaring script because ' + info.file + ' changed');
	});

	child.on('restart', function() {
	    console.error('Forever restarting script for ' + child.times + ' time');
	});

	child.on('exit:code', function(code) {
	    console.error('Forever detected script exited with code ' + code);
	});
	
	child.on('exit', function () {
		console.log('fleecyServer has exited after 3 restarts');
	});

	child.start();
}
module.exports = fleecy;