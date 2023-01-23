const express = require('express');
const router = require('./api/router');

const { PORT = 5174 } = process.env;

const app = express();

// // Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

// CORS
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

// Serve API requests from the router
app.use('/api', router);

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
