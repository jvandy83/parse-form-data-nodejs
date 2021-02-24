const fs = require('fs');
const http = require('http');
const { pipeline, PassThrough } = require('stream');

// Project modules
const { getSupportedEncoderInfo } = require('./encoding-util');

exports.CreateServer = function CreateServer(callback) {
  http
    .createServer((request, response) => {
      let encoderInfo = getSupportedEncoderInfo(request);

      if (!encoderInfo) {
        // Encoded not supported by this server
        response.statusCode = 406;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ error: 'Encodings not supported' }));
        return;
      }

      let body = response;
      response.setHeader('Content-Encoding', encoderInfo.name);

      // If encoding is not identity, encode the response =)
      if (!encoderInfo.isIdentity()) {
        const onError = (err) => {
          if (err) {
            // If an error occurs, there's not much we can do because
            // the server has already sent the 200 response code and
            // some amount of data has already been sent to the client.
            // The best we can do is terminate the response immediately
            // and log the error.
            response.end();
            console.error('An error occurred:', err);
          }
        };
        body = new PassThrough();
        pipeline(body, encoderInfo.createEncoder(), response, onError);
      }

      if (request.url === '/favicon.ico' && request.method === 'GET') {
        const path = `${__dirname}/rambo.ico`;
        const contentType = 'image/vnd.microsoft.icon';
        // Chrome & Safari have issues caching favicon's
        response.setHeader('Content-Type', contentType);
        fs.createReadStream(path).pipe(body);
      } else {
        callback(request, response, body);
      }
    })
    .listen(3000, () => {
      console.log(`Server running at http://localhost:3000/`);
    });
};
