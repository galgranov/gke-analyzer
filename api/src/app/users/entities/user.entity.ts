import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class UserEntity {
  @ApiPropertyOptional({ description: 'The MongoDB ObjectId' })
  _id?: ObjectId;

  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({ description: 'The hashed password of the user' })
  password: string;

  @ApiPropertyOptional({ description: 'The first name of the user' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'The last name of the user' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'The roles of the user', type: [String] })
  roles?: string[];

  @ApiPropertyOptional({ description: 'Whether the user is active' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'The creation date of the record' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'The last update date of the record' })
  updatedAt?: Date;
}
