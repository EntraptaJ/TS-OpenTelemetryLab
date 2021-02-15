// src/Modules/Counter/CounterModel.ts
import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Service } from 'typedi';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
@Service()
export class Counter {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Field()
  @CreateDateColumn()
  public readonly createdDate: Date;

  @Field()
  @UpdateDateColumn()
  public updatedDate: Date;

  @Column({
    type: 'int',
  })
  @Field(() => Int)
  public count: number;

  public increaseCount(): void {
    this.count++;
  }

  public decreaseCount(): void {
    this.count--;
  }
}
