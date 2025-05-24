import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { CustomLoggerService } from '../logger/logger.service';
import { ApiException } from '../exceptions/api.exception';

// Mock CustomLoggerService
const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn().mockReturnThis(),
};

// Mock Request and Response
const mockRequest = {
  url: '/test-url',
  method: 'GET',
  body: { testBody: 'test' },
  query: { testQuery: 'test' },
  params: { testParam: 'test' },
};

const mockResponseJson = jest.fn();
const mockResponseStatus = jest.fn().mockReturnValue({ json: mockResponseJson });
const mockGetResponse = jest.fn().mockReturnValue({ status: mockResponseStatus, json: mockResponseJson }); // Adjusted for direct json call if status is not chained
const mockGetRequest = jest.fn().mockReturnValue(mockRequest);

const mockArgumentsHost = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: mockGetRequest,
    getResponse: mockGetResponse,
  }),
} as unknown as ArgumentsHost;


describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    // Instantiate the filter with the mock logger
    filter = new GlobalExceptionFilter(mockLoggerService as any);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch - ApiException', () => {
    it('should handle ApiException and log a warning for status < 500', () => {
      const exception = new ApiException('Test API Exception', HttpStatus.BAD_REQUEST, 'TEST_CODE');
      exception.stack = 'Test stack trace';
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponseJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test API Exception',
        errorCode: 'TEST_CODE',
        timestamp: expect.any(String),
        path: '/test-url',
      });
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        `Error: Test API Exception`,
        `GlobalExceptionFilter - ${HttpStatus.BAD_REQUEST}`
      );
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Full error context for request',
        expect.stringContaining('"message":"Error: Test API Exception"'),
      );
    });

    it('should handle ApiException and log an error for status >= 500', () => {
      const exception = new ApiException('Test API Server Exception', HttpStatus.INTERNAL_SERVER_ERROR, 'SERVER_TEST_CODE');
      exception.stack = 'Test server stack trace';
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponseJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Test API Server Exception',
        errorCode: 'SERVER_TEST_CODE',
        timestamp: expect.any(String),
        path: '/test-url',
      });
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        `Error: Test API Server Exception`,
        'Test server stack trace',
        `GlobalExceptionFilter - ${HttpStatus.INTERNAL_SERVER_ERROR}`
      );
    });
  });

  describe('catch - HttpException (not ApiException)', () => {
    it('should handle HttpException and log a warning for status < 500', () => {
      const exception = new HttpException('Test HTTP Exception', HttpStatus.NOT_FOUND);
      exception.stack = 'Test HTTP stack trace';
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponseJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Test HTTP Exception',
        // errorCode should be undefined and thus removed by the filter
        timestamp: expect.any(String),
        path: '/test-url',
      });
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        `Error: Test HTTP Exception`,
        `GlobalExceptionFilter - ${HttpStatus.NOT_FOUND}`
      );
    });
  });

  describe('catch - Generic Error', () => {
    it('should handle generic Error and log an error', () => {
      const exception = new Error('Test Generic Error');
      exception.stack = 'Generic error stack';
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponseJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error: Test Generic Error',
        timestamp: expect.any(String),
        path: '/test-url',
      });
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error: Internal server error: Test Generic Error',
        'Generic error stack',
        `GlobalExceptionFilter - ${HttpStatus.INTERNAL_SERVER_ERROR}`
      );
    });
  });

  describe('catch - Unknown Exception', () => {
    it('should handle unknown exception type and log an error', () => {
      const exception = { someError: 'Unknown error object' }; // Plain object
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponseJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred.',
        timestamp: expect.any(String),
        path: '/test-url',
      });
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error: An unexpected error occurred.',
        undefined, // Stack might be undefined for non-Error objects
        `GlobalExceptionFilter - ${HttpStatus.INTERNAL_SERVER_ERROR}`
      );
    });
    
    it('should handle string exception type and log an error', () => {
        const exception = "A string error occurred"; 
        filter.catch(exception, mockArgumentsHost);
  
        expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockResponseJson).toHaveBeenCalledWith({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred.',
          timestamp: expect.any(String),
          path: '/test-url',
        });
        expect(mockLoggerService.error).toHaveBeenCalledWith(
          'Error: An unexpected error occurred.',
          undefined, 
          `GlobalExceptionFilter - ${HttpStatus.INTERNAL_SERVER_ERROR}`
        );
      });
  });
});
