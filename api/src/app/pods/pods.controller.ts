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
import { PodsService } from './pods.service';
import { CreatePodDto, UpdatePodDto } from './dto';
import { Pod } from './interfaces/pod.interface';

@Controller('pods')
export class PodsController {
  constructor(private readonly podsService: PodsService) {}

  @Post()
  create(@Body() createPodDto: CreatePodDto): Promise<Pod> {
    return this.podsService.create(createPodDto);
  }

  @Get()
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
  findOne(@Param('id') id: string): Promise<Pod> {
    return this.podsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePodDto: UpdatePodDto,
  ): Promise<Pod> {
    return this.podsService.update(id, updatePodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Pod> {
    return this.podsService.remove(id);
  }
}
