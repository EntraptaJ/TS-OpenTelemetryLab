/* eslint-disable @typescript-eslint/ban-types */
// src/Library/Database.ts
import { Service, Container } from 'typedi';
import { Connection, createConnection, useContainer } from 'typeorm';
import { findModuleFiles } from '../Utils/moduleFileFinder';
import { logger } from './Logger';

@Service()
export class DatabaseController {
  private connection: Connection;

  public async findModels(): Promise<Function[]> {
    const modelModules = await findModuleFiles<{ [key: string]: Function }>(
      /.*Model\.((ts|js)x?)/,
    );

    return modelModules.flatMap((resolverModule) =>
      Object.values(resolverModule),
    );
  }

  public async connectDatabase(): Promise<Connection> {
    const entities = await this.findModels();

    logger.info('Found entities', entities);

    useContainer(Container);

    this.connection = await createConnection({
      type: 'postgres',
      name: 'default',

      host: 'Database',
      port: 5432,

      database: 'ts-brain',
      username: 'postgres',
      password: 'pgpass',

      synchronize: true,

      entities,
    });

    return this.connection;
  }
}
