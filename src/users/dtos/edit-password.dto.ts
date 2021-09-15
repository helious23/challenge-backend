import { InputType, ObjectType, PickType, PartialType } from '@nestjs/graphql';

import { User } from '../entities/user.entity';
import { CoreOutput } from './output.dto';

@InputType()
export class EditPasswordInput extends PartialType(
  PickType(User, ['password']),
) {}

@ObjectType()
export class EditPasswordOutput extends CoreOutput {}
