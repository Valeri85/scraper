import http from 'node:http';
import data from './data.json' assert { type: 'json' };

const server = http.createServer((req, res) => {
	// const data = {
	// 	me: 'V',
	// 	shen: 'M',
	// };

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
});

server.listen(3003, () => {
	console.log('Server running on port 3003');
});
