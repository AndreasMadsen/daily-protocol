
var test = require('tap').test;
var async = require('async');
var setup = require('../setup.js')();
var dailyProtocol = require('../../daily-protocol.js');

setup.open();

test('destroy client', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    client.destroy();
    t.end();
  });
});

test('destroy server', function (t) {
  setup.pair(function (err, server, client) {
    t.equal(err, null);
    server = dailyProtocol.Server(server);
    client = dailyProtocol.Client(client);

    server.destroy();
    t.end();
  });
});

setup.close();
