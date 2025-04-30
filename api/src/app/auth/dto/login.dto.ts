import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The username or email of the user' })
  @IsNotEmpty()
  @IsString()
  readonly usernameOrEmail: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
