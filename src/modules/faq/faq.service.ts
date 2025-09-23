import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';


import { Repository } from 'typeorm';
import { FaqCategory } from './faq/faq-category';
import { FaqQuestion } from './faq/faq_question';

@Injectable()
export class FaqService extends BaseService<FaqQuestion> {
  constructor(
    @InjectRepository(FaqQuestion)
    public faq_question_repo: Repository<FaqQuestion>,
    @InjectRepository(FaqCategory)
    public faq_category_repo: Repository<FaqCategory>,
  ) {
    super(faq_question_repo);
  }

  async getQuestion(id): Promise<FaqQuestion[]> {
    return await this.faq_question_repo.find({
      where: { category_id: id },
    
    });
  }

  async getQuestions(): Promise<FaqQuestion[]> {
    return await this.faq_question_repo.find();
  }

  async getCategories() {
    const categories = await this.faq_category_repo.find();
    return categories;
  }
}
