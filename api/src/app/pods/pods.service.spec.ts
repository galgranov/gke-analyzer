import { Test, TestingModule } from '@nestjs/testing';
import { PodsService } from './pods.service';
import { DATABASE_CONNECTION, PODS_COLLECTION } from '../database/database.providers';
import { ObjectId, Collection, Db } from 'mongodb';
import { NotFoundException } from '@nestjs/common';
import { CreatePodDto } from './dto/create-pod.dto';
import { UpdatePodDto } from './dto/update-pod.dto';
import { Pod } from './interfaces/pod.interface';

describe('PodsService', () => {
  let service: PodsService;
  let podsCollection: jest.Mocked<Collection<Pod>>;
  let db: Partial<Db>;

  const mockPod: Pod = {
    _id: new ObjectId('5f9d88b3c7c7b2b9b8b8b8b8'),
    name: 'test-pod',
    namespace: 'default',
    status: 'Running',
    clusterName: 'test-cluster',
    nodeName: 'test-node',
    labels: { app: 'test' },
    annotations: { 'kubernetes.io/test': 'true' },
    creationTimestamp: new Date(),
    containerImages: ['nginx:latest'],
    resources: {
      requests: {
        cpu: '100m',
        memory: '128Mi',
      },
      limits: {
        cpu: '200m',
        memory: '256Mi',
      },
    },
    restartCount: 0,
    podIP: '10.0.0.1',
    hostIP: '192.168.1.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock for MongoDB collection
    podsCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      toArray: jest.fn(),
    } as unknown as jest.Mocked<Collection<Pod>>;

    // Mock the find().toArray() chain
    (podsCollection.find as jest.Mock).mockReturnValue({
      toArray: jest.fn().mockResolvedValue([mockPod]),
    });

    // Create mock for MongoDB database
    db = {
      collection: jest.fn().mockReturnValue(podsCollection),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: db,
        },
        {
          provide: PODS_COLLECTION,
          useValue: 'pods',
        },
      ],
    }).compile();

    service = module.get<PodsService>(PodsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a pod', async () => {
      const createPodDto: CreatePodDto = {
        name: 'test-pod',
        namespace: 'default',
        status: 'Running',
        clusterName: 'test-cluster',
        nodeName: 'test-node',
      };

      const insertedId = new ObjectId('5f9d88b3c7c7b2b9b8b8b8b8');
      (podsCollection.insertOne as jest.Mock).mockResolvedValue({
        insertedId,
      });

      const result = await service.create(createPodDto);

      expect(podsCollection.insertOne).toHaveBeenCalled();
      expect(result).toHaveProperty('_id', insertedId);
      expect(result).toHaveProperty('name', createPodDto.name);
      expect(result).toHaveProperty('namespace', createPodDto.namespace);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('findAll', () => {
    it('should return an array of pods', async () => {
      const result = await service.findAll();

      expect(podsCollection.find).toHaveBeenCalled();
      expect(result).toEqual([mockPod]);
    });
  });

  describe('findOne', () => {
    it('should return a pod by id', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      (podsCollection.findOne as jest.Mock).mockResolvedValue(mockPod);

      const result = await service.findOne(id);

      expect(podsCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
      expect(result).toEqual(mockPod);
    });

    it('should throw NotFoundException if pod is not found', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      (podsCollection.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(podsCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should throw NotFoundException if id format is invalid', async () => {
      const id = 'invalid-id';

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(podsCollection.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a pod', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updatePodDto: UpdatePodDto = {
        status: 'Completed',
      };

      const updatedPod = { ...mockPod, status: 'Completed' };
      (podsCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedPod);

      const result = await service.update(id, updatePodDto);

      expect(podsCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        {
          $set: {
            ...updatePodDto,
            updatedAt: expect.any(Date),
          },
        },
        { returnDocument: 'after' }
      );
      expect(result).toEqual(updatedPod);
    });

    it('should throw NotFoundException if pod is not found', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updatePodDto: UpdatePodDto = {
        status: 'Completed',
      };

      (podsCollection.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(service.update(id, updatePodDto)).rejects.toThrow(NotFoundException);
      expect(podsCollection.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException if id format is invalid', async () => {
      const id = 'invalid-id';
      const updatePodDto: UpdatePodDto = {
        status: 'Completed',
      };

      await expect(service.update(id, updatePodDto)).rejects.toThrow(NotFoundException);
      expect(podsCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a pod', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      (podsCollection.findOneAndDelete as jest.Mock).mockResolvedValue(mockPod);

      const result = await service.remove(id);

      expect(podsCollection.findOneAndDelete).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
      expect(result).toEqual(mockPod);
    });

    it('should throw NotFoundException if pod is not found', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      (podsCollection.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(podsCollection.findOneAndDelete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if id format is invalid', async () => {
      const id = 'invalid-id';

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(podsCollection.findOneAndDelete).not.toHaveBeenCalled();
    });
  });

  describe('findByNamespace', () => {
    it('should return pods filtered by namespace', async () => {
      const namespace = 'default';
      const result = await service.findByNamespace(namespace);

      expect(podsCollection.find).toHaveBeenCalledWith({ namespace });
      expect(result).toEqual([mockPod]);
    });
  });

  describe('findByCluster', () => {
    it('should return pods filtered by cluster name', async () => {
      const clusterName = 'test-cluster';
      const result = await service.findByCluster(clusterName);

      expect(podsCollection.find).toHaveBeenCalledWith({ clusterName });
      expect(result).toEqual([mockPod]);
    });
  });

  describe('findByNode', () => {
    it('should return pods filtered by node name', async () => {
      const nodeName = 'test-node';
      const result = await service.findByNode(nodeName);

      expect(podsCollection.find).toHaveBeenCalledWith({ nodeName });
      expect(result).toEqual([mockPod]);
    });
  });

  describe('findByStatus', () => {
    it('should return pods filtered by status', async () => {
      const status = 'Running';
      const result = await service.findByStatus(status);

      expect(podsCollection.find).toHaveBeenCalledWith({ status });
      expect(result).toEqual([mockPod]);
    });
  });
});
