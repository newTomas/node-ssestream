"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const stream_1 = require("stream");
const http_1 = __importDefault(require("http"));
const eventsource_1 = __importDefault(require("eventsource"));
const index_1 = require("../index");
const written = (stream) => new Promise((resolve, reject) => stream.on('error', reject).on('finish', resolve));
class Sink extends stream_1.Writable {
    constructor(writeHead) {
        super({ objectMode: true });
        this.writeHead = writeHead;
        this.chunks = [];
    }
    _write(chunk, encoding, callback) {
        this.chunks.push(chunk);
        callback();
    }
    get content() {
        return this.chunks.join('');
    }
}
describe('SseStream', () => {
    it('writes multiple multiline messages', async () => {
        const sse = new index_1.SseStream();
        const sink = new Sink();
        sse.pipe(sink);
        sse.writeMessage({
            data: 'hello\nworld',
        });
        sse.write({
            data: 'bonjour\nmonde',
        });
        sse.end();
        await written(sink);
        assert_1.default.equal(sink.content, `:ok

data: hello
data: world

data: bonjour
data: monde

`);
    });
    it('writes object messages as JSON', async () => {
        const sse = new index_1.SseStream();
        const sink = new Sink();
        sse.pipe(sink);
        sse.writeMessage({
            data: { hello: 'world' },
        });
        sse.end();
        await written(sink);
        assert_1.default.equal(sink.content, ':ok\n\ndata: {"hello":"world"}\n\n');
    });
    it('writes all message attributes', async () => {
        const sse = new index_1.SseStream();
        const sink = new Sink();
        sse.pipe(sink);
        sse.writeMessage({
            comment: 'jibber jabber',
            event: 'tea-time',
            id: 'the-id',
            retry: 222,
            data: 'hello',
        });
        sse.end();
        await written(sink);
        assert_1.default.equal(sink.content, `:ok

: jibber jabber
event: tea-time
id: the-id
retry: 222
data: hello

`);
    });
    it('sets headers on destination when it looks like a HTTP Response', callback => {
        const sse = new index_1.SseStream();
        let sink;
        sink = new Sink((status, headers) => {
            assert_1.default.deepEqual(headers, {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });
            callback();
            return sink;
        });
        sse.pipe(sink);
    });
    it('allows an eventsource to connect', callback => {
        let sse;
        const server = http_1.default.createServer((req, res) => {
            sse = new index_1.SseStream(req);
            sse.pipe(res);
        });
        server.listen(() => {
            const es = new eventsource_1.default(`http://localhost:${server.address().port}`);
            es.onmessage = e => {
                assert_1.default.equal(e.data, 'hello');
                es.close();
                server.close(callback);
            };
            es.onopen = () => sse.writeMessage({ data: 'hello' });
            es.onerror = e => callback(new Error(`Error from EventSource: ${JSON.stringify(e)}`));
        });
    });
});
//# sourceMappingURL=ssestream_test.js.map