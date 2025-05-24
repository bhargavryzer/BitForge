// Type definitions for NestJS modules

declare module '@nestjs/testing' {
  export class Test {
    static createTestingModule(metadata: any): TestingModuleBuilder;
  }

  export class TestingModuleBuilder {
    compile(): Promise<TestingModule>;
    overrideProvider(provider: any): any;
  }

  export class TestingModule {
    get<T>(typeOrToken: any): T;
    resolve<T>(typeOrToken: any): Promise<T>;
    init(): Promise<void>;
    close(): Promise<void>;
  }
}

declare module '@nestjs/config' {
  export class ConfigService {
    get<T>(propertyPath: string, defaultValue?: T): T;
  }
}

declare module '@nestjs/common' {
  export class Injectable {
    constructor();
  }

  export class ValidationPipe {
    constructor(options?: any);
  }

  export function Controller(prefix?: string): ClassDecorator;
  export function Get(path?: string): MethodDecorator;
  export function Post(path?: string): MethodDecorator;
  export function Put(path?: string): MethodDecorator;
  export function Delete(path?: string): MethodDecorator;
  export function Param(param?: string): ParameterDecorator;
  export function Query(param?: string): ParameterDecorator;
  export function Body(param?: string): ParameterDecorator;
}

declare module '@nestjs/swagger' {
  export function ApiTags(tags: string | string[]): ClassDecorator;
  export function ApiOperation(options: any): MethodDecorator;
  export function ApiParam(options: any): MethodDecorator;
  export function ApiQuery(options: any): MethodDecorator;
  export function ApiProperty(options?: any): PropertyDecorator;
  
  export class DocumentBuilder {
    setTitle(title: string): this;
    setDescription(description: string): this;
    setVersion(version: string): this;
    addTag(tag: string): this;
    build(): any;
  }
  
  export class SwaggerModule {
    static createDocument(app: any, options: any): any;
    static setup(path: string, app: any, document: any): void;
  }
}
