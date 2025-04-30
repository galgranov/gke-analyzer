import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PodsService } from './pods.service';
import { CreatePodDto, UpdatePodDto } from './dto';
import { Pod } from './interfaces/pod.interface';
import { PodEntity } from './entities/pod.entity';

@ApiTags('pods')
@Controller('pods')
export class PodsController {
  constructor(private readonly podsService: PodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pod' })
  @ApiResponse({ 
    status: 201, 
    description: 'The pod has been successfully created.',
    type: PodEntity
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createPodDto: CreatePodDto): Promise<Pod> {
    return this.podsService.create(createPodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pods with optional filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all pods.',
    type: [PodEntity]
  })
  @ApiQuery({ name: 'namespace', required: false, description: 'Filter pods by namespace' })
  @ApiQuery({ name: 'cluster', required: false, description: 'Filter pods by cluster name' })
  @ApiQuery({ name: 'node', required: false, description: 'Filter pods by node name' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter pods by status' })
  findAll(
    @Query('namespace') namespace?: string,
    @Query('cluster') clusterName?: string,
    @Query('node') nodeName?: string,
    @Query('status') status?: string,
  ): Promise<Pod[]> {
    if (namespace) {
      return this.podsService.findByNamespace(namespace);
    }
    if (clusterName) {
      return this.podsService.findByCluster(clusterName);
    }
    if (nodeName) {
      return this.podsService.findByNode(nodeName);
    }
    if (status) {
      return this.podsService.findByStatus(status);
    }
    return this.podsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pod by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the pod.',
    type: PodEntity
  })
  @ApiResponse({ status: 404, description: 'Pod not found.' })
  @ApiParam({ name: 'id', description: 'The id of the pod' })
  findOne(@Param('id') id: string): Promise<Pod> {
    return this.podsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pod' })
  @ApiResponse({ 
    status: 200, 
    description: 'The pod has been successfully updated.',
    type: PodEntity
  })
  @ApiResponse({ status: 404, description: 'Pod not found.' })
  @ApiParam({ name: 'id', description: 'The id of the pod' })
  update(
    @Param('id') id: string,
    @Body() updatePodDto: UpdatePodDto,
  ): Promise<Pod> {
    return this.podsService.update(id, updatePodDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pod' })
  @ApiResponse({ 
    status: 200, 
    description: 'The pod has been successfully deleted.',
    type: PodEntity
  })
  @ApiResponse({ status: 404, description: 'Pod not found.' })
  @ApiParam({ name: 'id', description: 'The id of the pod' })
  remove(@Param('id') id: string): Promise<Pod> {
    return this.podsService.remove(id);
  }
}
