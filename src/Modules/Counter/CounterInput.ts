// src/Modules/Counter/CounterInput.ts
import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class CounterInput {
  @Field(() => Int)
  public initialValue: number;
}
