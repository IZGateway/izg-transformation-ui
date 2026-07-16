// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

// jsdom does not define setImmediate/clearImmediate, but winston's transports
// (reached via the console.error → logger patch) rely on them. Polyfill so tests
// that exercise real logging don't throw ReferenceError. No-op under Node prod.
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args)
  global.clearImmediate = (id) => clearTimeout(id)
}
