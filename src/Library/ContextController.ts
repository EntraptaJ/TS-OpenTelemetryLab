// src/Library/ContextController.ts

import { FastifyRequest } from 'fastify';
import { ContainerInstance, Service, Container } from 'typedi';

export class Context {
  public requestId: string;

  public container: ContainerInstance;
}

interface ContextRequest {
  request: FastifyRequest;
}

@Service()
export class ContextController {
  public getContext({ request }: ContextRequest): Context {
    const requestId = request.id as string;

    const container = Container.of(requestId);

    const context = { requestId: requestId, container };
    container.set('context', context);

    return context;
  }
}
