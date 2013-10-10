
var EMPTY_BUFFER = new Buffer(0);

function RequestProtocol() {
  this.type = 'none';

  // case: write
  this.id = 0;
  this.seconds = 0;
  this.milliseconds = 0;
  this.level = 0;
  this.message = EMPTY_BUFFER;

  // case: read-start
  this.startSeconds = null;
  this.startMilliseconds = null;
  this.endSeconds = null;
  this.endMilliseconds = null;
  this.levels = [1, 9];

  // case: read-stop
}
module.exports = RequestProtocol;

RequestProtocol.prototype.encode = function (object) {
  this.type = object.type;

  if (this.type === 'write') {
    this.id = object.id;
    this.seconds = object.seconds;
    this.milliseconds = object.milliseconds;
    this.level = object.level;
    this.message = object.message;

    return this._encodeWrite();
  } else if (this.type === 'read-start') {
    this.startSeconds = object.startSeconds;
    this.startMilliseconds = object.startMilliseconds;
    this.endSeconds = object.endSeconds;
    this.endMilliseconds = object.endMilliseconds;
    this.levels = object.levels;

    return this._encodeReadStart();
  } else if (this.type === 'read-stop') {
    return this._encodeReadStop();
  } else {
    throw new TypeError('bad message type "' + this.type + '"');
  }
};

RequestProtocol.prototype.decode = function (buf) {
  var size = buf.length;
  if (size === 0) return;

  var type = buf.readUInt8(0);
  if (type === 0x01 && size >= 10) {
    this._decodeWrite(buf);
  } else if (type === 0x02 && (size === 3 || size === 9 || size === 15)) {
    this._decodeReadStart(buf);
  } else if (type === 0x03 && size === 1) {
    this._decodeReadStop(buf);
  }
  // else just leave the type = 'none'
};

// write type
RequestProtocol.prototype._encodeWrite = function () {
  var buf = new Buffer(10);
      buf.writeUInt8(0x01, 0);
      buf.writeUInt16BE(this.id, 1);
      buf.writeUInt32BE(this.seconds, 3);
      buf.writeUInt16BE(this.milliseconds, 7);
      buf.writeUInt8(this.level, 9);

  return Buffer.concat([buf, this.message]);
};

RequestProtocol.prototype._decodeWrite = function (buf) {
  this.type = 'write';
  this.id = buf.readUInt16BE(1);
  this.seconds = buf.readUInt32BE(3);
  this.milliseconds = buf.readUInt16BE(7);
  this.level = buf.readUInt8(9);
  this.message = buf.slice(10);
};

// read-start type
RequestProtocol.prototype._encodeReadStart = function () {
  var buf = new Buffer(3 +
                        (this.startSeconds === null ? 0 : 6) +
                        (this.endSeconds === null ? 0 : 6)
                      );
      buf.writeUInt8(0x02, 0);
      buf.writeUInt8(16 * this.levels[0] + this.levels[1], 1);

  var what = 0;
  var offset = 3;

  if (this.startSeconds !== null) {
    what += 0x10;
    buf.writeUInt32BE(this.startSeconds, 0 + offset);
    buf.writeUInt16BE(this.startMilliseconds, 4 + offset);
    offset += 6;
  }

  if (this.endSeconds !== null) {
    what += 0x01;
    buf.writeUInt32BE(this.endSeconds, 0 + offset);
    buf.writeUInt16BE(this.endMilliseconds, 4 + offset);
  }

  buf.writeUInt8(what, 2);

  return buf;
};

RequestProtocol.prototype._decodeReadStart = function (buf) {
  this.type = 'read-start';

  // levels
  var level = buf.readUInt8(1), tolevel = level % 16;
  this.levels = [(level - tolevel) / 16, tolevel];

  var what =  buf.readUInt8(2);
  var offset = 3;

  if (what === 0x11 || what === 0x10) {
    this.startSeconds = buf.readUInt32BE(0 + offset);
    this.startMilliseconds = buf.readUInt16BE(4 + offset);
    offset += 6;
  }

  if (what === 0x11 || what === 0x01) {
    this.endSeconds = buf.readUInt32BE(0 + offset);
    this.endMilliseconds = buf.readUInt16BE(4 + offset);
  }
};

// read-end type
RequestProtocol.prototype._encodeReadStop = function () {
  var buf = new Buffer(1);
      buf.writeUInt8(0x03, 0);

  return buf;
};

RequestProtocol.prototype._decodeReadStop = function () {
  this.type = 'read-stop';
};
