import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;

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
