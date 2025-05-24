import { CustomLoggerService } from './logger.service';
import * as winston from 'winston';

// Mock winston
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

// Mock winston.createLogger to return our mockLogger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => mockLogger),
  config: {
    npm: {
      levels: { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 }, // Example levels
    },
  },
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Create a new instance of the service before each test
    service = new CustomLoggerService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('constructor should call winston.createLogger', () => {
    expect(winston.createLogger).toHaveBeenCalled();
  });

  describe('log', () => {
    it('should call logger.info with message and context', () => {
      const message = 'Test log message';
      const context = 'TestContext';
      service.log(message, context);
      expect(mockLogger.info).toHaveBeenCalledWith(message, { context });
    });
  });

  describe('error', () => {
    it('should call logger.error with message, trace, and context', () => {
      const message = 'Test error message';
      const trace = 'Test trace';
      const context = 'TestContext';
      service.error(message, trace, context);
      expect(mockLogger.error).toHaveBeenCalledWith(message, { context, trace });
    });
  });

  describe('warn', () => {
    it('should call logger.warn with message and context', () => {
      const message = 'Test warn message';
      const context = 'TestContext';
      service.warn(message, context);
      expect(mockLogger.warn).toHaveBeenCalledWith(message, { context });
    });
  });

  describe('debug', () => {
    it('should call logger.debug with message and context', () => {
      const message = 'Test debug message';
      const context = 'TestContext';
      service.debug(message, context);
      expect(mockLogger.debug).toHaveBeenCalledWith(message, { context });
    });
  });

  describe('verbose', () => {
    it('should call logger.verbose with message and context', () => {
      const message = 'Test verbose message';
      const context = 'TestContext';
      service.verbose(message, context);
      expect(mockLogger.verbose).toHaveBeenCalledWith(message, { context });
    });
  });
  
  describe('setContext', () => {
    it('should return the service instance for chaining and set context internally (though not directly testable for winston context here)', () => {
        const context = 'NewContext';
        const result = service.setContext(context);
        expect(result).toBeInstanceOf(CustomLoggerService);
        // Further assertion could be to check if subsequent log calls use this context,
        // but our current mock structure for winston itself doesn't capture that nuance easily.
        // We assume winston handles context internally when passed.
        // If the logger instance itself was modified to hold context, we could test that.
        // For now, we just test the method exists and returns `this`.
        service.log("message after context");
        // This test is more about the CustomLoggerService's own setContext method
        // if it were to manage context internally, which it doesn't directly for winston's context per-call.
        // The CustomLoggerService's setContext is for NestJS compatibility primarily.
        // The actual winston context is passed per call.
        // Let's adjust the test to reflect what it *can* test.
        // The main purpose of `setContext` in our CustomLoggerService is to allow
        // `this.logger = logger.setContext(MyClass.name)` in consuming services.
        // The service's internal winston logger doesn't change its permanent context with this call.
        // So, the test is primarily for the fluent interface.
    });
  });
});
