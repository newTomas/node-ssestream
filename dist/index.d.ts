/// <reference types="node" />
import { Transform } from 'stream';
import { IncomingMessage, OutgoingHttpHeaders } from "http";
interface Message {
    data: string | object;
    comment?: string;
    event?: string;
    id?: string;
    retry?: number;
}
interface WriteHeaders {
    writeHead?(statusCode: number, headers?: OutgoingHttpHeaders): WriteHeaders;
    flushHeaders?(): void;
}
export declare type HeaderStream = NodeJS.WritableStream & WriteHeaders;
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
export declare class SseStream extends Transform {
    constructor(req?: IncomingMessage);
    pipe<T extends HeaderStream>(destination: T, options?: {
        end?: boolean;
    }): T;
    _transform(message: Message, encoding: string, callback: (error?: (Error | null), data?: any) => void): void;
    writeMessage(message: Message, encoding?: string, cb?: (error: Error | null | undefined) => void): boolean;
}
export {};
