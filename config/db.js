require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
	// DB Connection
	mongoose.connect(process.env.MONGO_CONNECTION_URL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: true
	});

	const db = mongoose.connection;

	db.once('open', () => {
		console.log('DB connected.');
	}).catch(err => {
		console.log('DB connection failed because' + err.message());
	})
	
}

module.exports = connectDB;