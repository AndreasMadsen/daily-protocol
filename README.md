#daily-protocol [![Build Status](https://secure.travis-ci.org/AndreasMadsen/daily-protocol.png)](http://travis-ci.org/AndreasMadsen/daily-protocol)

> [daily](https://github.com/AndreasMadsen/daily) - The protocol encoder and decoder for network communcation

## Installation

```sheel
npm install daily-protocol
```

## Documentation

**Unless you want to write your own low-level daily interfaces you don't need this module.**

### General

`daily-protocol` has two constructors `Client` and `Server`, they both wrap a
binary duplex stream and exposes a duplex object stream.

```
var dailyProtocol = require('daily-protocol');
```

### Client

To construct a client duplex stream:

```javascript
client = new dailyProtocol.Client(net.connect(port, address));

client.on('data', function (response) { });
client.write(request);
```

### Server

To construct a client duplex stream:

```javascript
net.createServer(function (socket) {
  server = new dailyProtocol.Setver(socket);

  server.on('data', function (request) { });
  server.write(response);
});
```

### Messages

The names are defined from the client perspective:

* `requests` can be written from the client and read from the server.
* `response` can be written from the server and read from the client.

The objects below are what you pass to `.write` or get from `.read`.

#### write -- request

```javascript
{
  'type': 'write',
  'id': Number(UInt16),
  'seconds': Number(UInt32)
  'milliseconds': Number(UInt16),
  'level': Number(UInt8),
  'message': new Buffer()
}
```

#### write -- response

```javascript
{
  'type': 'write',
  'id': Number(UInt16),
  'error': new Error() || null
}
```

#### read-start -- request

```javascript
{
  'type': 'read-start',
  'startSeconds': Number(UInt32) || null,
  'startMilliseconds': Number(UInt16) || null,
  'endSeconds': Number(UInt32) || null,
  'endMilliseconds': Number(UInt16) || null,
  'levels': [Number(UInt4), Number(UInt4)]
}
```

#### read-start -- response

```javascript
{
  'type': 'read-start',
  'seconds': Number(UInt32),
  'milliseconds': Number(UInt16),
  'level': Number(UInt8),
  'message': new Buffer()
}
```

#### read-stop -- request

```javascript
{
  'type': 'read-stop'
}
```

#### read-stop -- response

```javascript
{
  'type': 'read-stop',
  'error': new Error() || null
}
```

### Binary protocol

The reason behind using a binary protocol it to completly eliminate
`JSON.stringify` and `JSON.parse` on the server side. They are expensive and
error prone compared to just reading and writing integers from a buffer.

Below you see how the messages are encoded, for how to seperate each message
see the [binarypoint](https://github.com/AndreasMadsen/binarypoint) module. But
basicly its a `UInt16BE` there says how long the next message is in bytes.

```
 The binary protocol description symbols used below means:
  + : indicates required
  - : indicates optional

 request:
  + 1 byte: (0x01, 0x02, 0x03) = (write, read-start, read-stop)
 case: write
  + 2 byte: 16 bit id, resets on next timestamp
  + 4 byte: 32 bit second timestamp
  + 2 byte: 16 bit ms remain timestamp
  + 1 byte: (0x01 ... 0x09) = (level 1 ... level 9)
  + x byte: JSON string
  + 1 byte: 0x00 terminat command
 case: read-start
  + 1 byte: (0x19 ... 0x99) = (1-1, 1-2, ..., 1-9, 2-2, 2-3, ... 2-9, ..., 9-9)
  + 1 byte: 0x1- -> start time exists, 0x-1 end time exists
  - 4 byte: 32 bit second start timestamp
  - 2 byte: 16 bit ms remain start timestamp
  - 4 byte: 32 bit second end timestamp
  - 2 byte: 16 bit ms remain end timestamp
  + 1 byte: 0x00 terminat command
 case: read-stop
  + 1 byte: 0x00 terminat command

 response:
  + byte: (0x01, 0x02, 0x03) = (write, read-start, read-stop)
 case: write
  + 2 byte: 16 bit id, resets on next timestamp
  + 1 byte: (0x01, 0x02) = (no error, error)
  - x byte: JSON string
  + 1 byte: 0x00 terminat command
 case: read-start
  + 4 byte: 32 bit second timestamp
  + 2 byte: 16 bit ms remain timestamp
  + 1 byte: (0x01 ... 0x09) = (level 1 ... level 9)
  + x byte: JSON string
  + 1 byte: 0x00 terminat command
 case: read-stop
  + 1 byte: (0x01, 0x02) = (no error, error)
  - x byte: JSON string
  + 1 byte: 0x00 terminat command
```

##License

**The software is license under "MIT"**

> Copyright (c) 2013 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
