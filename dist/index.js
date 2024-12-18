"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseStream = void 0;
const stream_1 = require("stream");
function dataString(data) {
    if (typeof data === 'object')
        return dataString(JSON.stringify(data));
    return data.split(/\r\n|\r|\n/).map(line => `data: ${line}\n`).join('');
}
/**
 * Transforms "messages" to W3C event stream content.
 * See https://html.spec.whatwg.org/multipage/server-sent-events.html
 * A message is an object with one or more of the following properties:
 * - data (String or object, which gets turned into JSON)
 * - event
 * - id
 * - retry
 * - comment
 *
 * If constructed with a HTTP Request, it will optimise the socket for streaming.
 * If this stream is piped to an HTTP Response, it will set appropriate headers.
 */
class SseStream extends stream_1.Transform {
    constructor(req) {
        super({ objectMode: true });
        if (req) {
            req.socket.setKeepAlive(true);
            req.socket.setNoDelay(true);
            req.socket.setTimeout(0);
        }
    }
    pipe(destination, options) {
        if (destination.writeHead) {
            destination.writeHead(200, {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            });
            destination.flushHeaders();
        }
        // Some clients (Safari) don't trigger onopen until the first frame is received.
        destination.write(':ok\n\n');
        return super.pipe(destination, options);
    }
    _transform(message, encoding, callback) {
        if (message.comment)
            this.push(`: ${message.comment}\n`);
        if (message.event)
            this.push(`event: ${message.event}\n`);
        if (message.id)
            this.push(`id: ${message.id}\n`);
        if (message.retry)
            this.push(`retry: ${message.retry}\n`);
        if (message.data)
            this.push(dataString(message.data));
        this.push('\n');
        callback();
    }
    writeMessage(message, encoding, cb) {
        return this.write(message, encoding, cb);
    }
}
exports.SseStream = SseStream;
//# sourceMappingURL=index.js.map