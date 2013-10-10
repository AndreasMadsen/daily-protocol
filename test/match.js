
module.exports = function (t, actual, expected) {
  var actualPost = {};
  var expectedPost = {};

  Object.keys(expected).forEach(function (name) {
    var ex = expected[name], ac = actual[name];

    if (ex instanceof Error) {
      t.strictEqual(ac.message, ex.message);
      t.strictEqual(ac.name, ex.name);
    }
    else if (Buffer.isBuffer(ex)) {
      t.strictEqual(ac.toString('hex'), ex.toString('hex'));
    }
    else if (Array.isArray(ex)) {
      t.deepEqual(ac, ex);
    }
    else {
      t.strictEqual(ac, ex);
    }
  });

  t.deepEqual(actualPost, expectedPost);
};
