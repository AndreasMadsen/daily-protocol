
var test = require('tap').test;
var match = require('../match.js');
var setup = require('../setup.js')();
var dailyProtocol = require('../../daily-protocol.js');

setup.open();

test('bad encode type :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'bad'
    };

    try {
      client.write(input);
    } catch (e) {
      t.equal(e.name, 'TypeError');
      t.equal(e.message, 'bad message type "bad"');

      server.end();
      server.once('close', t.end.bind(t));
    }
  });
});

test('bad encode type :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    var input = {
      type: 'bad'
    };

    try {
      server.write(input);
    } catch (e) {
      t.equal(e.name, 'TypeError');
      t.equal(e.message, 'bad message type "bad"');

      client.end();
      client.once('close', t.end.bind(t));
    }
  });
});

test('no decode type :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer([0x00, 0x00]);

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

test('bad decode type :: client -> server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);

    var buffer = new Buffer([0x00, 0x01, 0x10]);

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

test('no decode type :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer([0x00, 0x00]);

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

test('bad decode type :: server -> client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    client = dailyProtocol.Client(client);

    var buffer = new Buffer([0x00, 0x01, 0x10]);

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
