// src/index.ts
import './Utils/setup';
import fastify from 'fastify';
import hyperid from 'hyperid';
import { logger } from './Library/Logger';
import { Container } from 'typedi';

const { DatabaseController } = await import('./Library/Database');

const databaseController = Container.get(DatabaseController);

const webServer = fastify({
  /**
   * Unique UUIDs for each request for logging and tracking
   */
  genReqId: () => hyperid().uuid,
});

logger.info('Connecting to database');

await databaseController.connectDatabase();

logger.info('Connected to database, creating Apollo Server');

const { GraphQLController } = await import('./Library/GraphQL');

const graphqlController = Container.get(GraphQLController);

const apiServer = await graphqlController.createApolloServer();

await webServer.register(apiServer.createHandler());

const listeningHost = await webServer.listen(8089, '0.0.0.0');

logger.info(`Server is listening on ${listeningHost}`);
