const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Server is working! Phone can connect.</h1>');
});

server.listen(5173, '0.0.0.0', () => {
  console.log('Test server running on http://0.0.0.0:5173');
});
