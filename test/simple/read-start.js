
var test = require('tap').test;
var match = require('../match.js');
var setup = require('../setup.js')();
var dailyProtocol = require('../../daily-protocol.js');

setup.open();

test('read-start no-start no-end :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-start',
      'startSeconds': null,
      'startMilliseconds': null,
      'endSeconds': null,
      'endMilliseconds': null,
      'levels': [1, 9]
    };

    client.write(input);
    server.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-start start no-end :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-start',
      'startSeconds': 1000,
      'startMilliseconds': 500,
      'endSeconds': null,
      'endMilliseconds': null,
      'levels': [1, 9]
    };

    client.write(input);
    server.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});


test('read-start no-start end :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-start',
      'startSeconds': null,
      'startMilliseconds': null,
      'endSeconds': 2000,
      'endMilliseconds': 250,
      'levels': [1, 9]
    };

    client.write(input);
    server.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-start start end :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-start',
      'startSeconds': 1000,
      'startMilliseconds': 500,
      'endSeconds': 2000,
      'endMilliseconds': 250,
      'levels': [1, 9]
    };

    client.write(input);
    server.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-start normal message :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-start',
      'seconds': 1000,
      'milliseconds': 500,
      'level': 3,
      'message': new Buffer('some log')
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-start empty message :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      'type': 'read-start',
      'seconds': 1000,
      'milliseconds': 500,
      'level': 3,
      'message': new Buffer(0)
    };

    server.write(input);
    client.once('data', function (output) {
      match(t, output, input);

      client.end();
      client.once('close', t.end.bind(t));
    });
  });
});

test('read-start no-start no-error too short :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer(4);
        buffer.writeUInt16BE(0x02, 0);
        buffer.writeUInt8(0x02, 2);

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

test('read-start start or error too short :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer(10);
        buffer.writeUInt16BE(0x08, 0);
        buffer.writeUInt8(0x02, 2);

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

test('read-start start and error too short :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer(16);
        buffer.writeUInt16BE(0x0e, 0);
        buffer.writeUInt8(0x02, 2);

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

test('read-start too short :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer(9);
        buffer.writeUInt16BE(0x07, 0);
        buffer.writeUInt8(0x02, 2);

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
