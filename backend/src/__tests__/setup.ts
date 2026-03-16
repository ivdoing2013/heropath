// Jest setup file
import { jest } from '@jest/globals'

// Set test environment variables
process.env.DEEPSEEK_API_KEY = 'test-api-key'
process.env.DEEPSEEK_BASE_URL = 'https://api.test.deepseek.com'

// Global test timeout
jest.setTimeout(10000)

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks()
})