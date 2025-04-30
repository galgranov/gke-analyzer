import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'The username of the user' })
  @IsOptional()
  @IsString()
  readonly username?: string;

  @ApiPropertyOptional({ description: 'The email of the user' })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional({ description: 'The password of the user' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;

  @ApiPropertyOptional({ description: 'The first name of the user' })
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @ApiPropertyOptional({ description: 'The last name of the user' })
  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @ApiPropertyOptional({ description: 'The roles of the user', type: [String] })
  @IsOptional()
  @IsArray()
  readonly roles?: string[];

  @ApiPropertyOptional({ description: 'Whether the user is active' })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
