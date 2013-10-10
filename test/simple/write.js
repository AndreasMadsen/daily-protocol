
var test = require('tap').test;
var match = require('../match.js');
var setup = require('../setup.js')();
var dailyProtocol = require('../../daily-protocol.js');

setup.open();

test('write :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'write',
      id: 500,
      seconds: 1010,
      milliseconds: 40,
      level: 5,
      message: new Buffer('simple data')
    };

    client.write(input);
    server.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('write no-error :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'write',
      id: 500,
      error: null
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('write error :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'write',
      id: 500,
      error: new RangeError('some error')
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('write illegal error name :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'write',
      id: 500,
      error: { name: 'eval', message: 'throw new Error("bad")' }
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, {
        type: 'write',
        id: 500,
        error: new TypeError('protocol: illegal error type eval')
      });

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('write illegal error encoding :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer(2 + 1 + 2 + 1 + 12);
        buffer.writeUInt16BE(1 + 2 + 1 + 12, 0);
        buffer.writeUInt8(0x01, 2);
        buffer.writeUInt16BE(500, 3);
        buffer.writeUInt8(0x01, 5);
        buffer.write('invalid JSON', 6);

    server.write(buffer);
    client.once('data', function (output) {
      match(t, output, {
        type: 'write',
        id: 500,
        error: new SyntaxError('Unexpected token i')
      });

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('write too short message :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer(11);
        buffer.writeUInt16BE(0x09, 0);
        buffer.writeUInt8(0x01, 2);

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

test('write too short message :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer(5);
        buffer.writeUInt16BE(0x03, 0);
        buffer.writeUInt8(0x01, 2);

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
