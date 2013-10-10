
var util = require('util');
var parser = require('./parser');
var ProtocolAbstaction = require('./socket.js');

function ClientProtocol(socket) {
  if (!(this instanceof ClientProtocol)) return new ClientProtocol(socket);
  ProtocolAbstaction.call(this, socket);

  this._Encoder = parser.Request;
  this._Decoder = parser.Response;
}
module.exports = ClientProtocol;
util.inherits(ClientProtocol, ProtocolAbstaction);
