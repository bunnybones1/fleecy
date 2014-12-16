var fleecy = require('./');

new fleecy({
        inputPath:'./example/src/Main.as',
        compilerOptions: {
			output: './test.swf',
			'defines': {
				'STATUS::testNumber': 1.0,
				'STATUS::testBoolean': true,
				'STATUS::log': 'Hello World!'
			},
	    	'source-paths': [
				'./example/extraSrc',
				'./example/extraSrc2'
			]
		}
    });
