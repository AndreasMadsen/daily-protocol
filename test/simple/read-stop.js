
var test = require('tap').test;
var match = require('../match.js');
var setup = require('../setup.js')();
var dailyProtocol = require('../../daily-protocol.js');

setup.open();

test('read-stop :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-stop'
    };

    client.write(input);
    server.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-stop no-error :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-stop',
      'error': null
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-stop error :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-stop',
      'error': new RangeError('some message')
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-stop illegal error name :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'read-stop',
      error: { name: 'eval', message: 'throw new Error("bad")' }
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, {
        type: 'read-stop',
        error: new TypeError('protocol: illegal error type eval')
      });

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-stop illegal error encoding :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer(2 + 1 + 1 + 12);
        buffer.writeUInt16BE(1 + 1 + 12, 0);
        buffer.writeUInt8(0x03, 2);
        buffer.writeUInt8(0x01, 3);
        buffer.write('invalid JSON', 4);

    server.write(buffer);
    client.once('data', function (output) {
      match(t, output, {
        type: 'read-stop',
        error: new SyntaxError('Unexpected token i')
      });

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-stop too long :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer(4);
        buffer.writeUInt16BE(0x02, 0);
        buffer.writeUInt8(0x03, 2);

    client.write(buffer);
    server.once('data', function (output) {
      match(t, output, {
        type: 'none'
      });

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-stop too short :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer(3);
        buffer.writeUInt16BE(0x01, 0);
        buffer.writeUInt8(0x03, 2);

    server.write(buffer);
    client.once('data', function (output) {
      match(t, output, {
        type: 'none'
      });

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

setup.close();
