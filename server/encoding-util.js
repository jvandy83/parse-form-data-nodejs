const zlib = require('zlib');

const kGzip = 'gzip';
const kDeflate = 'deflate';
const kBr = 'br';
const kAny = '*';
const kIdentity = 'identity';

class EncoderInfo {
  constructor(name) {
    this.name = name;
  }
  isIdentity() {
    return this.name === kIdentity;
  }
  createEncoder() {
    switch (this.name) {
      case kGzip:
        return zlib.createGzip();
      case kDeflate:
        return zlib.createDeflate();
      case kBr:
        return zlib.createBrotliCompress();
      default:
        return null;
    }
  }
}

class ClientEncodingInfo {
  constructor(name, qvalue) {
    this.name = name;
    this.qvalue = qvalue;
  }
}

exports.getSupportedEncoderInfo = function getSupportedEncoderInfo(request) {
  // See https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
  let acceptEncoding = request.headers['accept-encoding'];
  let acceptEncodings = [];
  let knownEncodings = [kGzip, kDeflate, kBr, kAny, kIdentity];
  // If explicit is true, then it means the client sent *;q=0, meaning accept only given encodings
  let explicit = false;
  if (!acceptEncoding || acceptEncoding.trim().length === 0) {
    // If the Accept-Encoding field-value is empty, then only the "identity" encoding is acceptable.
    knownEncodings = [kIdentity];
    acceptEncodings = [new ClientEncodingInfo(kIdentity, 1)];
  } else {
    // NOTE: Only return 406 if the client sends 'identity;q=0' or a '*;q=0'
    let acceptEncodingArray = acceptEncoding.split(',');
    for (let encoding of acceptEncodingArray) {
      encoding = encoding.trim();
      if (/[a-z*];q=0$/.test(encoding)) {
        // The "identity" content-coding is always acceptable, unless
        // specifically refused because the Accept-Encoding field includes
        // "identity;q=0", or because the field includes "*;q=0" and does
        // not explicitly include the "identity" content-coding.
        let split = encoding.split(';');
        let name = split[0].trim();
        if (name === kAny) {
          explicit = true;
        }
        knownEncodings.splice(knownEncodings.indexOf(name), 1);
      } else if (/[a-z*]+;q=\d+(.\d+)*/.test(encoding)) {
        // This string contains a qvalue.
        let split = encoding.split(';');
        let name = split[0].trim();
        let value = split[1].trim();
        value = value.split('=')[1];
        value = parseFloat(value);
        acceptEncodings.push(new ClientEncodingInfo(name, value));
      } else {
        // No qvalue, treat it as q=1.0
        acceptEncodings.push(new ClientEncodingInfo(encoding.trim(), 1.0));
      }
    }
    // order by qvalue, max to min
    acceptEncodings.sort((a, b) => {
      return b.qvalue - a.qvalue;
    });
  }
  // `acceptEncodings` is sorted by priority
  // Pick the first known encoding.
  let encoding = '';
  for (let encodingInfo of acceptEncodings) {
    if (knownEncodings.indexOf(encodingInfo.name) !== -1) {
      encoding = encodingInfo.name;
      break;
    }
  }

  // If any, pick a known encoding
  if (encoding === kAny) {
    for (let knownEncoding of knownEncodings) {
      if (knownEncoding === kAny) {
        continue;
      } else {
        encoding = knownEncoding;
        break;
      }
    }
  }

  // If no known encoding was set, then use identity if not excluded
  if (encoding.length === 0) {
    if (!explicit && knownEncodings.indexOf(kIdentity) !== -1) {
      encoding = kIdentity;
    } else {
      console.error(
        'No known encoding were found in accept-encoding, return http status code 406'
      );
      return null;
    }
  }

  return new EncoderInfo(encoding);
};
