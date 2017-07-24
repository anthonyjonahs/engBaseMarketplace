var client= require('mongodb');

var mongodb = null;

let url = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudtrials';


module.exports = {
	url,
	connect: function () {
		client.MongoClient.connect(this.url, function (err, database) {
			if (err) {
		    	console.log(err);
		    	process.exit(1);
		  	}

		  	// Save database object from the callback for reuse.
		  	mongodb = database;
		  	console.log("MongoDB database connection ready");
		});
	},
	db: function() {
		return mongodb;
	},
	close: function() {
		mongodb.close();
	}
}
