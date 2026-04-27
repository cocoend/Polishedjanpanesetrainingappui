import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import {
  findExplanationModelByIdOrSlug,
  getExplanationModelSummaries,
} from '../master-data/master-data';
import { MasterDataService } from '../master-data/master-data.service';

@ApiTags('explanation-models')
@Controller('explanation-models')
export class ExplanationModelsController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      example: getExplanationModelSummaries(),
    },
  })
  async listExplanationModels() {
    return this.masterDataService.listExplanationModels();
  }

  @Get(':modelId')
  @ApiOkResponse({
    schema: {
      example: findExplanationModelByIdOrSlug('prep'),
    },
  })
  async getExplanationModel(@Param('modelId') modelId: string) {
    const model = await this.masterDataService.getExplanationModelByIdOrSlug(modelId);

    if (!model) {
      throw new NotFoundException(`Explanation model "${modelId}" was not found.`);
    }

    return model;
  }
}
