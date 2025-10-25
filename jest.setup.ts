import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill for ReadableStream
global.ReadableStream = ReadableStream as any;

// Polyfill for Headers - minimal implementation for testing
if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {
    private map: Map<string, string>;

    constructor(init?: Record<string, string> | Headers) {
      this.map = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value: string, key: string) => {
            this.map.set(key.toLowerCase(), value);
          });
        } else {
          Object.entries(init).forEach(([key, value]) => {
            this.map.set(key.toLowerCase(), value);
          });
        }
      }
    }

    get(name: string): string | null {
      return this.map.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string): void {
      this.map.set(name.toLowerCase(), value);
    }

    has(name: string): boolean {
      return this.map.has(name.toLowerCase());
    }

    delete(name: string): void {
      this.map.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.map.forEach((value, key) => callback(value, key));
    }

    entries(): IterableIterator<[string, string]> {
      return this.map.entries();
    }

    keys(): IterableIterator<string> {
      return this.map.keys();
    }

    values(): IterableIterator<string> {
      return this.map.values();
    }
  } as any;
}

// Polyfill for Response - minimal implementation for testing
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    public readonly status: number;
    public readonly statusText: string;
    public readonly headers: Headers;
    public readonly ok: boolean;
    private _body: string;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this._body = body ? String(body) : "";
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "";
      this.headers = new (global.Headers as any)(init?.headers || {});
      this.ok = this.status >= 200 && this.status < 300;
    }

    async text(): Promise<string> {
      return this._body;
    }

    async json(): Promise<any> {
      return JSON.parse(this._body);
    }

    clone(): Response {
      return new (global.Response as any)(this._body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
  } as any;
}

// Polyfill for Request - minimal implementation for testing
if (typeof global.Request === "undefined") {
  global.Request = class Request {
    public readonly url: string;
    public readonly method: string;
    public readonly headers: Headers;
    private _body: string;

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === "string") {
        this.url = input;
      } else {
        this.url = input.url;
      }
      this.method = init?.method || "GET";
      this.headers = new (global.Headers as any)(init?.headers || {});
      this._body = init?.body ? String(init.body) : "";
    }

    async text(): Promise<string> {
      return this._body;
    }

    async json(): Promise<any> {
      return JSON.parse(this._body);
    }

    clone(): Request {
      return new (global.Request as any)(this.url, {
        method: this.method,
        headers: this.headers,
        body: this._body,
      });
    }
  } as any;
}
