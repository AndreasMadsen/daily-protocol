
var util = require('util');
var stream = require('stream');
var BinaryPoint = require('binarypoint');

function ProtocolAbstaction(socket) {
  stream.Duplex.call(this, {
    objectMode: true,
    highWaterMark: 16
  });

  var self = this;

  this._socket = socket;

  // This will split and join the binary messages
  // The event handlers will parse the output data
  this._resource = new BinaryPoint(socket);
  this._resource.on('data', function (buffer) { self._data(buffer); });
  this._resource.once('end', function () { self.push(null); });

  // Relay errors and the actual close
  this._resource.once('close', this.emit.bind(this, 'close'));
  this._resource.on('error', this.emit.bind(this, 'error'));

  // End was called on this end relay that to the resource
  this.once('finish', function () { self._resource.end(); });
}
module.exports = ProtocolAbstaction;
util.inherits(ProtocolAbstaction, stream.Duplex);

ProtocolAbstaction.prototype._data = function (buffer) {
  var protocol = new this._Decoder();
      protocol.decode(buffer);

  var more = this.push(protocol);
  if (!more) this._socket.pause();
};

ProtocolAbstaction.prototype._read = function () {
  this._resource.resume();
};

ProtocolAbstaction.prototype._write = function (message, encoding, done) {
  var protocol = new this._Encoder();
  var buffer = protocol.encode(message);

  if (this._resource.write(buffer, encoding)) {
    done(null);
  } else {
    this._resource.once('drain', done);
  }
};

ProtocolAbstaction.prototype.destroy = function () {
  this._socket.destroy();
};
