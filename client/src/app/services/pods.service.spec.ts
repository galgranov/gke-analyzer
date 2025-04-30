import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PodsService } from './pods.service';
import { Pod, CreatePodDto, UpdatePodDto } from '@my-monorepo/api-interfaces';

describe('PodsService', () => {
  let service: PodsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/pods';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PodsService]
    });

    service = TestBed.inject(PodsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPods', () => {
    it('should return all pods', () => {
      const mockPods: Pod[] = [
        { _id: '1', name: 'pod-1', namespace: 'default', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-1' },
        { _id: '2', name: 'pod-2', namespace: 'kube-system', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-2' }
      ];

      service.getPods().subscribe(pods => {
        expect(pods).toEqual(mockPods);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPods);
    });
  });

  describe('getPodsByNamespace', () => {
    it('should return pods filtered by namespace', () => {
      const namespace = 'default';
      const mockPods: Pod[] = [
        { _id: '1', name: 'pod-1', namespace: 'default', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-1' }
      ];

      service.getPodsByNamespace(namespace).subscribe(pods => {
        expect(pods).toEqual(mockPods);
      });

      const req = httpMock.expectOne(`${apiUrl}?namespace=${namespace}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPods);
    });
  });

  describe('getPodsByCluster', () => {
    it('should return pods filtered by cluster', () => {
      const clusterName = 'cluster-1';
      const mockPods: Pod[] = [
        { _id: '1', name: 'pod-1', namespace: 'default', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-1' },
        { _id: '2', name: 'pod-2', namespace: 'kube-system', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-2' }
      ];

      service.getPodsByCluster(clusterName).subscribe(pods => {
        expect(pods).toEqual(mockPods);
      });

      const req = httpMock.expectOne(`${apiUrl}?cluster=${clusterName}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPods);
    });
  });

  describe('getPodsByNode', () => {
    it('should return pods filtered by node', () => {
      const nodeName = 'node-1';
      const mockPods: Pod[] = [
        { _id: '1', name: 'pod-1', namespace: 'default', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-1' }
      ];

      service.getPodsByNode(nodeName).subscribe(pods => {
        expect(pods).toEqual(mockPods);
      });

      const req = httpMock.expectOne(`${apiUrl}?node=${nodeName}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPods);
    });
  });

  describe('getPodsByStatus', () => {
    it('should return pods filtered by status', () => {
      const status = 'Running';
      const mockPods: Pod[] = [
        { _id: '1', name: 'pod-1', namespace: 'default', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-1' },
        { _id: '2', name: 'pod-2', namespace: 'kube-system', status: 'Running', clusterName: 'cluster-1', nodeName: 'node-2' }
      ];

      service.getPodsByStatus(status).subscribe(pods => {
        expect(pods).toEqual(mockPods);
      });

      const req = httpMock.expectOne(`${apiUrl}?status=${status}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPods);
    });
  });

  describe('getPod', () => {
    it('should return a single pod by id', () => {
      const podId = '1';
      const mockPod: Pod = { 
        _id: '1', 
        name: 'pod-1', 
        namespace: 'default', 
        status: 'Running', 
        clusterName: 'cluster-1', 
        nodeName: 'node-1' 
      };

      service.getPod(podId).subscribe(pod => {
        expect(pod).toEqual(mockPod);
      });

      const req = httpMock.expectOne(`${apiUrl}/${podId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPod);
    });
  });

  describe('createPod', () => {
    it('should create a new pod', () => {
      const newPod: CreatePodDto = {
        name: 'new-pod',
        namespace: 'default',
        status: 'Pending',
        clusterName: 'cluster-1',
        nodeName: 'node-1'
      };
      
      const mockResponse: Pod = {
        _id: '3',
        ...newPod
      };

      service.createPod(newPod).subscribe(pod => {
        expect(pod).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPod);
      req.flush(mockResponse);
    });
  });

  describe('updatePod', () => {
    it('should update an existing pod', () => {
      const podId = '1';
      const updatePod: UpdatePodDto = {
        status: 'Succeeded'
      };
      
      const mockResponse: Pod = {
        _id: '1',
        name: 'pod-1',
        namespace: 'default',
        status: 'Succeeded',
        clusterName: 'cluster-1',
        nodeName: 'node-1'
      };

      service.updatePod(podId, updatePod).subscribe(pod => {
        expect(pod).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${podId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updatePod);
      req.flush(mockResponse);
    });
  });

  describe('deletePod', () => {
    it('should delete a pod', () => {
      const podId = '1';
      const mockResponse: Pod = {
        _id: '1',
        name: 'pod-1',
        namespace: 'default',
        status: 'Running',
        clusterName: 'cluster-1',
        nodeName: 'node-1'
      };

      service.deletePod(podId).subscribe(pod => {
        expect(pod).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${podId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
