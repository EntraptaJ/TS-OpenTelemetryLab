/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/ban-types */
// src/Library/GraphQL.ts
import { buildSchema, NonEmptyArray, ResolverData } from 'type-graphql';
import { GraphQLSchema } from 'graphql';
import Container, { ContainerInstance, Inject, Service } from 'typedi';
import { findModuleFiles } from '../Utils/moduleFileFinder';
import { Context, ContextController } from './ContextController';
import type {
  GraphQLRequestContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { logger } from './Logger';

type ApolloServer = import('apollo-server-fastify').ApolloServer;

@Service()
export class GraphQLController {
  private apolloServer: ApolloServer;

  @Inject(() => ContextController)
  private contextController: ContextController;

  private async findResolvers(): Promise<Function[]> {
    const modules = await findModuleFiles<{ [key: string]: Function }>(
      /.*Resolver\.(js|ts)/,
    );

    return modules.flatMap((moduleExports) => Object.values(moduleExports));
  }

  private buildGQLSchema(resolvers: Function[]): Promise<GraphQLSchema> {
    return buildSchema({
      resolvers: resolvers as NonEmptyArray<Function>,
      container: ({ context }: ResolverData<Context>) => context.container,
      dateScalarMode: 'isoDate',
    });
  }

  public async createApolloServer(): Promise<ApolloServer> {
    const [{ ApolloServer }, resolvers] = await Promise.all([
      import('apollo-server-fastify'),
      this.findResolvers(),
    ]);

    const schema = await this.buildGQLSchema(resolvers);

    this.apolloServer = new ApolloServer({
      schema,
      introspection: true,
      context: this.contextController.getContext,
      plugins: [
        {
          requestDidStart: (): GraphQLRequestListener<Context> => ({
            willSendResponse(
              requestContext: GraphQLRequestContext<Context>,
            ): void {
              // remember to dispose the scoped container to prevent memory leaks
              Container.reset(requestContext.context.requestId);

              // for developers curiosity purpose, here is the logging of current scoped container instances
              // we can make multiple parallel requests to see in console how this works
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              const instancesIds = ((Container as any)
                .instances as ContainerInstance[]).map(
                (instance) => instance.id as string,
              );
              logger.silly('instances left in memory:', {
                instancesIds,
              });
            },
          }),
        },
      ],
      playground: {
        settings: {
          'editor.theme': 'light',
          'general.betaUpdates': true,
        },
        workspaceName: 'TS-OpenTelem',
      },
    });

    return this.apolloServer;
  }
}
