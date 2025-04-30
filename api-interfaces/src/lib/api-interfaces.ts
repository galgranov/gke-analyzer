export interface Pod {
  _id?: string; // Using string instead of ObjectId for client compatibility
  name: string;
  namespace: string;
  status?: string;
  clusterName?: string;
  nodeName?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  creationTimestamp?: Date;
  containerImages?: string[];
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
  restartCount?: number;
  podIP?: string;
  hostIP?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePodDto {
  name: string;
  namespace: string;
  status?: string;
  clusterName?: string;
  nodeName?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  creationTimestamp?: Date;
  containerImages?: string[];
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
  restartCount?: number;
  podIP?: string;
  hostIP?: string;
}

// Using a type alias instead of an interface to avoid ESLint warnings
export type UpdatePodDto = Partial<CreatePodDto>;
