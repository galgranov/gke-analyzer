import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { CreatePodDto, UpdatePodDto } from './dto';
import { Pod } from './interfaces/pod.interface';
import { DATABASE_CONNECTION, PODS_COLLECTION } from '../database/database.providers';

@Injectable()
export class PodsService {
  private readonly podsCollection: Collection<Pod>;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Db
  ) {
    this.podsCollection = this.db.collection<Pod>(PODS_COLLECTION);
  }

  async create(createPodDto: CreatePodDto): Promise<Pod> {
    const now = new Date();
    const podToInsert = {
      ...createPodDto,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await this.podsCollection.insertOne(podToInsert as any);
    return { ...podToInsert, _id: result.insertedId };
  }

  async findAll(): Promise<Pod[]> {
    return this.podsCollection.find().toArray();
  }

  async findOne(id: string): Promise<Pod> {
    try {
      const pod = await this.podsCollection.findOne({ _id: new ObjectId(id) });
      if (!pod) {
        throw new NotFoundException(`Pod with ID ${id} not found`);
      }
      return pod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Pod with ID ${id} not found or invalid ID format`);
    }
  }

  async update(id: string, updatePodDto: UpdatePodDto): Promise<Pod> {
    try {
      const result = await this.podsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updatePodDto,
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        throw new NotFoundException(`Pod with ID ${id} not found`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Pod with ID ${id} not found or invalid ID format`);
    }
  }

  async remove(id: string): Promise<Pod> {
    try {
      const result = await this.podsCollection.findOneAndDelete({ _id: new ObjectId(id) });
      
      if (!result) {
        throw new NotFoundException(`Pod with ID ${id} not found`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Pod with ID ${id} not found or invalid ID format`);
    }
  }

  // Additional methods for filtering pods
  async findByNamespace(namespace: string): Promise<Pod[]> {
    return this.podsCollection.find({ namespace }).toArray();
  }

  async findByCluster(clusterName: string): Promise<Pod[]> {
    return this.podsCollection.find({ clusterName }).toArray();
  }

  async findByNode(nodeName: string): Promise<Pod[]> {
    return this.podsCollection.find({ nodeName }).toArray();
  }

  async findByStatus(status: string): Promise<Pod[]> {
    return this.podsCollection.find({ status }).toArray();
  }
}
