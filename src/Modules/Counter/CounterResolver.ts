// src/Modules/Counter/CounterResolver.ts
import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CounterInput } from './CounterInput';
import { Counter } from './CounterModel';

@Service()
@Resolver()
export class CounterResolver {
  @InjectRepository(Counter)
  private counterRepository: Repository<Counter>;

  @Query(() => [Counter])
  public async counters(): Promise<Counter[]> {
    return this.counterRepository.find({
      order: {
        updatedDate: 'DESC',
      },
    });
  }

  @Mutation(() => Counter)
  public async createCounter(
    @Arg('input', () => CounterInput) input: CounterInput,
  ): Promise<Counter> {
    const counter = this.counterRepository.create({
      count: input.initialValue,
    });

    return this.counterRepository.save(counter);
  }

  @Mutation(() => Counter)
  public async increaseCount(
    @Arg('counterId', () => ID) id: string,
  ): Promise<Counter> {
    const counter = await this.counterRepository.findOneOrFail(id);

    counter.increaseCount();

    return this.counterRepository.save(counter);
  }

  @Mutation(() => Counter)
  public async decreaseCount(
    @Arg('counterId', () => ID) id: string,
  ): Promise<Counter> {
    const counter = await this.counterRepository.findOneOrFail(id);

    counter.decreaseCount();

    return this.counterRepository.save(counter);
  }
}
