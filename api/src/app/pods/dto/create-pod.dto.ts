import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePodDto {
  @ApiProperty({ description: 'The name of the pod' })
  readonly name: string;

  @ApiProperty({ description: 'The namespace of the pod' })
  readonly namespace: string;

  @ApiPropertyOptional({ description: 'The status of the pod' })
  readonly status?: string;

  @ApiPropertyOptional({ description: 'The name of the cluster' })
  readonly clusterName?: string;

  @ApiPropertyOptional({ description: 'The name of the node' })
  readonly nodeName?: string;

  @ApiPropertyOptional({ description: 'The labels of the pod' })
  readonly labels?: Record<string, string>;

  @ApiPropertyOptional({ description: 'The annotations of the pod' })
  readonly annotations?: Record<string, string>;

  @ApiPropertyOptional({ description: 'The creation timestamp of the pod' })
  readonly creationTimestamp?: Date;

  @ApiPropertyOptional({ description: 'The container images of the pod', type: [String] })
  readonly containerImages?: string[];

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
  readonly resources?: {
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
  readonly restartCount?: number;

  @ApiPropertyOptional({ description: 'The IP address of the pod' })
  readonly podIP?: string;

  @ApiPropertyOptional({ description: 'The IP address of the host' })
  readonly hostIP?: string;
}
