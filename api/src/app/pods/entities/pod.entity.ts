import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class PodEntity {
  @ApiPropertyOptional({ description: 'The MongoDB ObjectId' })
  _id?: ObjectId;

  @ApiProperty({ description: 'The name of the pod' })
  name: string;

  @ApiProperty({ description: 'The namespace of the pod' })
  namespace: string;

  @ApiPropertyOptional({ description: 'The status of the pod' })
  status?: string;

  @ApiPropertyOptional({ description: 'The name of the cluster' })
  clusterName?: string;

  @ApiPropertyOptional({ description: 'The name of the node' })
  nodeName?: string;

  @ApiPropertyOptional({ description: 'The labels of the pod' })
  labels?: Record<string, string>;

  @ApiPropertyOptional({ description: 'The annotations of the pod' })
  annotations?: Record<string, string>;

  @ApiPropertyOptional({ description: 'The creation timestamp of the pod' })
  creationTimestamp?: Date;

  @ApiPropertyOptional({ description: 'The container images of the pod', type: [String] })
  containerImages?: string[];

  @ApiPropertyOptional({ 
    description: 'The resource requests and limits of the pod',
    example: {
      requests: {
        cpu: '100m',
        memory: '128Mi'
      },
      limits: {
        cpu: '200m',
        memory: '256Mi'
      }
    }
  })
  resources?: {
    requests?: {
      cpu?: string;
      memory?: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };

  @ApiPropertyOptional({ description: 'The restart count of the pod' })
  restartCount?: number;

  @ApiPropertyOptional({ description: 'The IP address of the pod' })
  podIP?: string;

  @ApiPropertyOptional({ description: 'The IP address of the host' })
  hostIP?: string;

  @ApiPropertyOptional({ description: 'The creation date of the record' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'The last update date of the record' })
  updatedAt?: Date;
}
