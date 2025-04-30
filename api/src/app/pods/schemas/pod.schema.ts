import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PodDocument = Pod & Document;

@Schema({ timestamps: true })
export class Pod {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  namespace: string;

  @Prop()
  status: string;

  @Prop()
  clusterName: string;

  @Prop()
  nodeName: string;

  @Prop({ type: Object })
  labels: Record<string, string>;

  @Prop({ type: Object })
  annotations: Record<string, string>;

  @Prop()
  creationTimestamp: Date;

  @Prop({ type: [String] })
  containerImages: string[];

  @Prop({ type: Object })
  resources: {
    requests?: {
      cpu?: string;
      memory?: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };

  @Prop()
  restartCount: number;

  @Prop()
  podIP: string;

  @Prop()
  hostIP: string;
}

export const PodSchema = SchemaFactory.createForClass(Pod);
