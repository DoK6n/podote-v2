import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RemoveDocumentInput {
  @Field(() => String)
  @IsString()
  id: string;
}