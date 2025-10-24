import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill for ReadableStream
global.ReadableStream = ReadableStream as any;

// Polyfill for Request, Response, Headers (Next.js web APIs)
if (typeof global.Request === "undefined") {
  global.Request = class Request {} as any;
}
if (typeof global.Response === "undefined") {
  global.Response = class Response {} as any;
}
if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {} as any;
}
