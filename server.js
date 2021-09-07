const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + '/client', {
	index: false,
	immutable: true,
	cacheControl: true,
	maxAge: "30d"
}));

app.use(express.json());

const connectDB = require('./config/db')

connectDB();

//cors
const corsOptions = {
	origin: process.env.ALLOWED_CLIENTS.split(',')
}

app.use(cors(corsOptions));

//Template engine
app.set('views', path.join(__dirname, '/client'));
app.set('view engine', 'ejs');

//routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/download'));
app.use('/files/file-download', require('./routes/file_download'));

app.listen(PORT, () => {
	console.log(`Listening on Port ${PORT}`)
});

