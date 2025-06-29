// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill Web Standard APIs for Node.js environment (for API route tests)
// import { TextEncoder, TextDecoder } from 'util';
// global.TextEncoder = TextEncoder;
// global.TextDecoder = TextDecoder;

// import { Request, Response, Headers, FormData, File, URL, URLSearchParams } from 'undici';

// if (typeof global.Request === 'undefined') {
//   global.Request = Request;
//   global.Response = Response;
//   global.Headers = Headers;
//   global.FormData = FormData;
//   global.File = File;
// }
// // URL and URLSearchParams are usually available in modern Node, but good to ensure
// if (typeof global.URL === 'undefined') {
//     global.URL = URL;
// }
// if (typeof global.URLSearchParams === 'undefined') {
//     global.URLSearchParams = URLSearchParams;
// }
// Relying on @jest-environment node for API tests to provide these globals.
