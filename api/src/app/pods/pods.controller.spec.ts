import { Test, TestingModule } from '@nestjs/testing';
import { PodsController } from './pods.controller';
import { PodsService } from './pods.service';
import { CreatePodDto } from './dto/create-pod.dto';
import { UpdatePodDto } from './dto/update-pod.dto';
import { ObjectId } from 'mongodb';
import { Pod } from './interfaces/pod.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('PodsController', () => {
  let controller: PodsController;
  let service: PodsService;

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

  const mockPodsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByNamespace: jest.fn(),
    findByCluster: jest.fn(),
    findByNode: jest.fn(),
    findByStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PodsController],
      providers: [
        {
          provide: PodsService,
          useValue: mockPodsService,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PodsController>(PodsController);
    service = module.get<PodsService>(PodsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('test', () => {
    it('should return a test message', () => {
      expect(controller.test()).toEqual({
        message: 'This is a public test endpoint for the pods controller',
      });
    });
  });

  describe('findPublic', () => {
    it('should return a limited set of pods', async () => {
      const mockPods = Array(10).fill(mockPod);
      jest.spyOn(service, 'findAll').mockResolvedValue(mockPods);

      const result = await controller.findPublic();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(5);
      expect(result).toEqual(mockPods.slice(0, 5));
    });
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

      jest.spyOn(service, 'create').mockResolvedValue(mockPod);

      const result = await controller.create(createPodDto);
      expect(service.create).toHaveBeenCalledWith(createPodDto);
      expect(result).toEqual(mockPod);
    });
  });

  describe('findAll', () => {
    it('should return all pods when no query params are provided', async () => {
      const mockPods = [mockPod];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockPods);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPods);
    });

    it('should filter pods by namespace when namespace param is provided', async () => {
      const mockPods = [mockPod];
      jest.spyOn(service, 'findByNamespace').mockResolvedValue(mockPods);

      const result = await controller.findAll('default');
      expect(service.findByNamespace).toHaveBeenCalledWith('default');
      expect(result).toEqual(mockPods);
    });

    it('should filter pods by cluster when cluster param is provided', async () => {
      const mockPods = [mockPod];
      jest.spyOn(service, 'findByCluster').mockResolvedValue(mockPods);

      const result = await controller.findAll(undefined, 'test-cluster');
      expect(service.findByCluster).toHaveBeenCalledWith('test-cluster');
      expect(result).toEqual(mockPods);
    });

    it('should filter pods by node when node param is provided', async () => {
      const mockPods = [mockPod];
      jest.spyOn(service, 'findByNode').mockResolvedValue(mockPods);

      const result = await controller.findAll(undefined, undefined, 'test-node');
      expect(service.findByNode).toHaveBeenCalledWith('test-node');
      expect(result).toEqual(mockPods);
    });

    it('should filter pods by status when status param is provided', async () => {
      const mockPods = [mockPod];
      jest.spyOn(service, 'findByStatus').mockResolvedValue(mockPods);

      const result = await controller.findAll(undefined, undefined, undefined, 'Running');
      expect(service.findByStatus).toHaveBeenCalledWith('Running');
      expect(result).toEqual(mockPods);
    });
  });

  describe('findOne', () => {
    it('should return a pod by id', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPod);

      const result = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPod);
    });
  });

  describe('update', () => {
    it('should update a pod', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      const updatePodDto: UpdatePodDto = {
        status: 'Completed',
      };

      jest.spyOn(service, 'update').mockResolvedValue({
        ...mockPod,
        status: 'Completed',
      });

      const result = await controller.update(id, updatePodDto);
      expect(service.update).toHaveBeenCalledWith(id, updatePodDto);
      expect(result).toEqual({
        ...mockPod,
        status: 'Completed',
      });
    });
  });

  describe('remove', () => {
    it('should remove a pod', async () => {
      const id = '5f9d88b3c7c7b2b9b8b8b8b8';
      jest.spyOn(service, 'remove').mockResolvedValue(mockPod);

      const result = await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPod);
    });
  });
});
