const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = 8000;
const URL = 'https://widget.streamthunder.org/';

axios(URL).then(response => {
	const html = response.data;

	console.log(html);

	const $ = cheerio.load(html);

	console.log($('.ui-accordion', html));
});

app.listen(PORT, console.log(`server running on port ${PORT}`));
