
var test = require('tap').test;
var async = require('async');
var net = require('net');

function Setup() {
  if (!(this instanceof Setup)) return new Setup();
  this.server = net.createServer();

  this.port = 0;
  this.address = 0;
}
module.exports = Setup;

Setup.prototype.open = function () {
  var self = this;
  test('setup open', function (t) {
    self.server.listen(0, '127.0.0.1', function () {
      self.port = self.server.address();
      t.end();
    });
  });
};

Setup.prototype.close = function () {
  var self = this;
  test('setup close', function (t) {
    self.server.close(function () {
      t.end();
    });
  });
};

Setup.prototype.pair = function (callback) {
  var self = this;

  async.parallel({
    server: function (done) {
      self.server.once('connection', function (socket) { done(null, socket); });
    },
    client: function (done) {
      var socket = net.connect(self.port, self.address);
          socket.once('connect', function () { done(null, socket); });
    }
  }, function (err, result) {
    callback(err || null, result.server, result.client);
  });
};
