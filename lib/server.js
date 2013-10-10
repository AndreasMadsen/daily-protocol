
var util = require('util');
var parser = require('./parser');
var ProtocolAbstaction = require('./socket.js');

function ServerProtocol(socket) {
  if (!(this instanceof ServerProtocol)) return new ServerProtocol(socket);
  ProtocolAbstaction.call(this, socket);

  this._Encoder = parser.Response;
  this._Decoder = parser.Request;
}
module.exports = ServerProtocol;
util.inherits(ServerProtocol, ProtocolAbstaction);
