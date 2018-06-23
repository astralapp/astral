/* eslint-disable no-undef */
export default {
  auth: false,
  withAuth: jest.fn().mockReturnThis(),
  withoutAuth: jest.fn().mockReturnThis(),
  get: jest.fn(() => Promise.resolve({})),
  post: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({})),
  patch: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve({}))
}
