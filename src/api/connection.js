const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MongoURI;
mongoose.set('autoCreate', false); // disable create table automatically
mongoose.set('strictQuery', true);

console.log(uri);

const connectionParams = {
	serverSelectionTimeoutMS: 5000,
};

module.exports.openConnection = async () => {
	let db;
	try {
		db = mongoose.connect(uri, connectionParams);
	} catch (error) {
		console.error('error at DB! ', error);
		throw error;
	}
	return db;
};

this.openConnection();
