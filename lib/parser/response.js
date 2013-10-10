
var EMPTY_BUFFER = new Buffer(0);

function ResponseProtocol() {
  this.type = 'none';
  this.error = null;

  // case: write
  this.id = 0;

  // case: read-start
  this.seconds = 0;
  this.milliseconds = 0;
  this.level = 0;
  this.message = EMPTY_BUFFER;

  // case: read-stop
}
module.exports = ResponseProtocol;

ResponseProtocol.prototype.encode = function (object) {
  this.type = object.type;

  if (this.type === 'write') {
    this.error = object.error;
    this.id = object.id;

    return this._encodeWrite();
  } else if (this.type === 'read-start') {
    this.seconds = object.seconds;
    this.milliseconds = object.milliseconds;
    this.level = object.level;
    this.message = object.message;

    return this._encodeReadStart();
  } else if (this.type === 'read-stop') {
    this.error = object.error;

    return this._encodeReadStop();
  } else {
    throw new TypeError('bad message type "' + this.type + '"');
  }
};

ResponseProtocol.prototype.decode = function (buf) {
  var size = buf.length;
  if (size === 0) return;

  var type = buf.readUInt8(0);
  if (type === 0x01 && size >= 4) {
    this._decodeWrite(buf);
  } else if (type === 0x02 && size >= 8) {
    this._decodeReadStart(buf);
  } else if (type === 0x03 && size >= 2) {
    this._decodeReadStop(buf);
  }
  // else just leave the type = 'none'
};

// error
ResponseProtocol.prototype._encodeError = function () {
  var buf;

  if (this.error === null) {
    buf = new Buffer(1);
    buf.writeUInt8(0x00, 0);
  } else {
    var encode = JSON.stringify({ message: this.error.message, name: this.error.name });
    buf = new Buffer(1 + encode.length);
    buf.writeUInt8(0x01, 0);
    buf.write(encode, 1, 'ascii');
  }

  return buf;
};

var ALLOWED_ERROR_TYPES = [
  'Error', 'EvalError', 'RangeError', 'ReferenceError',
  'SyntaxError', 'TypeError', 'URIError'
];

ResponseProtocol.prototype._decodeError = function (buf) {
  var error = null, decode;
  var iserror = buf.readUInt8(0);
  if (iserror === 0x01) {
    try {
      decode = JSON.parse(buf.toString('ascii', 1));
    } catch (e) { return e; }

    // SECURITY: Without this it would be possible to execute custom code
    // on remote. E.Q.: decode = { name: 'eval', message: 'throw "ups";' };
    if (ALLOWED_ERROR_TYPES.indexOf(decode.name) === -1) {
      return new TypeError('protocol: illegal error type ' + decode.name);
    }

    error = new global[decode.name](decode.message.toString());
  }

  return error;
};

// write type
ResponseProtocol.prototype._encodeWrite = function () {
  var buf = new Buffer(3);
      buf.writeUInt8(0x01, 0);
      buf.writeUInt16BE(this.id, 1);

  return Buffer.concat([buf, this._encodeError()]);
};

ResponseProtocol.prototype._decodeWrite = function (buf) {
  this.type = 'write';
  this.id = buf.readUInt16BE(1);
  this.error = this._decodeError(buf.slice(3));
};

//read-start type
ResponseProtocol.prototype._encodeReadStart = function () {
  var buf = new Buffer(8);
      buf.writeUInt8(0x02, 0);
      buf.writeUInt32BE(this.seconds, 1);
      buf.writeUInt16BE(this.milliseconds, 5);
      buf.writeUInt8(this.level, 7);

  return Buffer.concat([buf, this.message]);
};

ResponseProtocol.prototype._decodeReadStart = function (buf) {
  this.type = 'read-start';
  this.seconds = buf.readUInt32BE(1);
  this.milliseconds = buf.readUInt16BE(5);
  this.level = buf.readUInt8(7);
  this.message = buf.slice(8);
};

// read-stop type
ResponseProtocol.prototype._encodeReadStop = function () {
  var buf = new Buffer(1);
      buf.writeUInt8(0x03, 0);

  return Buffer.concat([buf, this._encodeError()]);
};

ResponseProtocol.prototype._decodeReadStop = function (buf) {
  this.type = 'read-stop';
  this.error = this._decodeError(buf.slice(1));
};
