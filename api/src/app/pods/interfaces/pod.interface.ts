import { ObjectId } from 'mongodb';

export interface Pod {
  _id?: ObjectId;
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
