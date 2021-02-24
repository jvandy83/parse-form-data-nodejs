const fs = require('fs');

// Project modules
const { CreateServer } = require('./server');
const SecurityUtils = require('./security-utils');

CreateServer((request, response, body) => {
  if (request.url === '/' && request.method === 'GET') {
    response.setHeader('Content-Type', 'text/html');
    const stream = fs.createReadStream(`${__dirname}/index.html`);
    stream.pipe(body);
  } else if (request.url === '/' && request.method === 'POST') {
    const contentLength = 90000000000;
    SecurityUtils.readRequestDataInMemory(
      request,
      response,
      body,
      contentLength,
      (error, data) => {
        if (error) {
          console.error(error.message);
          return;
        }

        // No error, all client data, server side parsing was successful.
        //
        // Now we can do whatever we want with the data, in the below code
        // I'm saving the uploaded file to the root of the node server and
        // returning the parsed data as json, I'm removing the binary data
        // from the response.
        //
        // In production this can redirect to another site that makes sense,
        // in the below commented code it redirects to the home page:
        //    response.setHeader('Location', '/')
        //    response.statusCode = 301
        //    body.end()

        if (data.files) {
          for (let file of data.files) {
            const stream = fs.createWriteStream(file.filename);
            stream.write(file.picture, 'binary');
            stream.close();
            file.picture = 'bin';
          }
        }
        response.setHeader('Content-Type', 'text/plain');
        body.end(JSON.stringify(data));
      }
    );
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.statusCode = 404;
    body.end('<html lang="en"><body><h1>Page Doesn\'t exist<h1></body></html>');
  }
});
