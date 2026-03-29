import type {
  IDeviceFingerprintingService,
  IVirtualUserManagerService,
  ISessionService,
  IVirtualMemoryService,
  IConversationService,
  IContextService,
  ILoggerService
} from '../interfaces/service-interfaces.js';

import pino from 'pino';

type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

interface ServiceRegistration<T> {
  factory: ServiceFactory<T>;
  instance?: ServiceInstance<T>;
  scope: 'singleton' | 'transient';
}

class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, ServiceRegistration<unknown>> = new Map();
  private logger: ReturnType<typeof pino>;

  private constructor() {
    this.logger = pino({ level: 'info' });
    this.registerDefaultServices();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  private registerDefaultServices(): void {
    this.registerSingleton<ILoggerService>(
      'ILoggerService',
      () => this.logger
    );
  }

  registerSingleton<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, { factory, scope: 'singleton' });
  }

  registerTransient<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, { factory, scope: 'transient' });
  }

  getService<T>(serviceName: string): T {
    const registration = this.services.get(serviceName);
    
    if (!registration) {
      throw new Error(`Service '${serviceName}' is not registered`);
    }

    if (registration.scope === 'singleton') {
      if (!registration.instance) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    return registration.factory() as T;
  }

  hasService(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  clear(): void {
    this.services.clear();
    this.registerDefaultServices();
  }
}

export const container = ServiceContainer.getInstance();

export function getService<T>(serviceName: string): T {
  return container.getService<T>(serviceName);
}

export function createServiceFactory<T>(
  serviceName: string,
  dependencies: string[] = []
): () => T {
  return () => {
    const deps = dependencies.map(dep => container.getService(dep));
    return container.getService<T>(serviceName);
  };
}

export class ServiceLocator {
  get logger(): ILoggerService {
    return getService<ILoggerService>('ILoggerService');
  }
}

export const serviceLocator = new ServiceLocator();
