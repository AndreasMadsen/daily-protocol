
var test = require('tap').test;
var async = require('async');
var setup = require('../setup.js')();
var dailyProtocol = require('../../daily-protocol.js');

setup.open();

test('close on client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    async.parallel({
      clientEnd: client.once.bind(client, 'end'),
      clientClose: client.once.bind(client, 'close'),
      serverEnd: server.once.bind(server, 'end'),
      serverClose: server.once.bind(server, 'close')
    }, function (err) {
      t.equal(err, null);
      t.end();
    });

    client.resume();
    server.resume();
    client.end();
  });
});

test('close on server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    async.parallel({
      clientEnd: client.once.bind(client, 'end'),
      clientClose: client.once.bind(client, 'close'),
      serverEnd: server.once.bind(server, 'end'),
      serverClose: server.once.bind(server, 'close')
    }, function (err) {
      t.equal(err, null);
      t.end();
    });

    client.resume();
    server.resume();
    server.end();
  });
});

setup.close();
