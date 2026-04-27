import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  findThemeByIdOrSlug,
  getThemeList,
} from '../master-data/master-data';
import { MasterDataService } from '../master-data/master-data.service';

@ApiTags('themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get()
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiOkResponse({
    schema: {
      example: getThemeList(),
    },
  })
  async listThemes(
    @Query('level') level?: string,
    @Query('category') category?: string,
  ) {
    return this.masterDataService.listThemes({
      level,
      category,
    });
  }

  @Get(':themeId')
  @ApiOkResponse({
    schema: {
      example: findThemeByIdOrSlug('describe-coffee'),
    },
  })
  async getTheme(@Param('themeId') themeId: string) {
    const theme = await this.masterDataService.getThemeByIdOrSlug(themeId);

    if (!theme) {
      throw new NotFoundException(`Theme "${themeId}" was not found.`);
    }

    return theme;
  }

  @Get(':themeId/detail')
  @ApiOkResponse({
    schema: {
      example: {
        theme: findThemeByIdOrSlug('describe-coffee'),
        recommendedModel: {
          id: 'model-stepbystep',
          slug: 'stepbystep',
          nameJa: 'ステップ解説法',
          shortDescription: '按顺序一步一步说明过程。',
          steps: ['第一段階', '第二段階', '第三段階', '完成'],
        },
      },
    },
  })
  async getThemeDetail(@Param('themeId') themeId: string) {
    const theme = await this.masterDataService.getThemeByIdOrSlug(themeId);

    if (!theme) {
      throw new NotFoundException(`Theme "${themeId}" was not found.`);
    }

    const recommendedModel = await this.masterDataService.getExplanationModelByIdOrSlug(
      theme.recommendedModelId,
    );

    if (!recommendedModel) {
      throw new NotFoundException(
        `Recommended model "${theme.recommendedModelId}" for theme "${themeId}" was not found.`,
      );
    }

    return {
      theme,
      recommendedModel: {
        id: recommendedModel.id,
        slug: recommendedModel.slug,
        nameJa: recommendedModel.nameJa,
        shortDescription: recommendedModel.shortDescription,
        steps: recommendedModel.steps,
      },
    };
  }
}
