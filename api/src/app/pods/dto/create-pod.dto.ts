export class CreatePodDto {
  readonly name: string;
  readonly namespace: string;
  readonly status?: string;
  readonly clusterName?: string;
  readonly nodeName?: string;
  readonly labels?: Record<string, string>;
  readonly annotations?: Record<string, string>;
  readonly creationTimestamp?: Date;
  readonly containerImages?: string[];
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
  readonly restartCount?: number;
  readonly podIP?: string;
  readonly hostIP?: string;
}
