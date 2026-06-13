import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  phone_number?: string;

  address?: string;

  tarriff_rate?: number; //in minor units
}
