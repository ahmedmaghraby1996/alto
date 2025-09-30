import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { plainToInstance } from 'class-transformer';
import { ChatResponse } from './dto/chat.response';
import { MessageRespone } from './dto/message.response';
import { ChatGateway } from 'src/integration/gateways/chat.gateway';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';

@ApiTags('Chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('start')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        driver_id: { type: 'string', example: 'store-uuid-456' },
      },
      required: ['store_id'],
    },
  })
  async startChat(@Body() body: { driver_id: string }) {
    return new ActionResponse(await this.chatService.startChat(body.driver_id));
  }

  @Post(':driver_id/send')
  @ApiParam({
    name: 'driver_id',
    required: true,
    type: String,
    description: 'ID of the chat',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'Hello, how can I help you?' },
      },
      required: ['sender_id', 'content'],
    },
  })
  async sendMessage(
    @Param('driver_id') driver_id: string,
    @Body() body: { sender_id: string; content: string },
  ) {
    return new ActionResponse(
      await this.chatService.sendMessage(driver_id, body.content),
    );
  }

  @Get(':chat_id/messages')
  @ApiParam({
    name: 'chat_id',
    required: true,
    type: String,
    description: 'ID of the chat',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starting from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of messages per page',
  })
  async getMessages(
    @Param('chat_id') chat_id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const messages = await this.chatService.getMessages(
      chat_id,
      Number(page),
      Number(limit),
    );

    return new PaginatedResponse(
      plainToInstance(MessageRespone, messages.items, {
        excludeExtraneousValues: true,
      }),
      { meta: { total: messages.total, page, limit } },
    );
  }

  @Get('all')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starting from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of chats per page',
  })
  async getChats(@Query('page') page = 1, @Query('limit') limit = 20) {
    const { items, total } = await this.chatService.getUserChats(
      Number(page),
      Number(limit),
    );

    return new ActionResponse(
      plainToInstance(ChatResponse, items, { excludeExtraneousValues: true }),
      {
        meta: { total: total, page, limit },
      },
    );
  }
}
