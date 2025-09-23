import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";


import { FaqController } from "./faq.controller";
import { FaqService } from "./faq.service";
import { FaqQuestion } from "./faq/faq_question";

@Module({
  
    imports: [
    
      TypeOrmModule.forFeature([FaqQuestion])],
    controllers: [FaqController],
    providers: [FaqService],  

  })
  export class FaqModule {}