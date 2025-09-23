import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';

import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CreateFaqRequest, UpdateFaqRequest } from './dto/create-faq.request';
import { plainToInstance } from 'class-transformer';
import { FaqQuestion } from './faq/faq_question';

@Controller('faq')
@ApiTags('Faq')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)

@ApiBearerAuth()
export class FaqController {
  constructor(
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    private readonly serivce: FaqService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}


  @Get()
  async getCategories() {
    const res = await this.serivce.getCategories();
    const result = this._i18nResponse.entity(res, this.request.user['roles']);
    return new ActionResponse(result);
  }
  @Get('/category/:id')
  async getQuestion(@Param('id') id: string) {
    const res = await this.serivce.getQuestion(id);
    const result = this._i18nResponse.entity(res, this.request.user.roles);
    return new ActionResponse(result);
  }

  @Post()
  async createQuestion(@Body() req: CreateFaqRequest) {
    const res = await this.serivce.create(plainToInstance(FaqQuestion, req));

    return new ActionResponse(res);
  }

  @Put('/:id')
  async updateQuestion(@Param('id') id: string, @Body() req: UpdateFaqRequest) {

    const res = await this.serivce.update(plainToInstance(FaqQuestion, {...req, id}));
    return new ActionResponse(res);
  }
  @Delete('/:id')
  async deleteQuestion(@Param('id') id: string) {
    const res = await this.serivce.delete(id);
    return new ActionResponse(res);
  }
}
