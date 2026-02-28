import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Main')
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @Get('ping')
  ping(@Query('token') token: string): { status: string; client: string } {
    if (token !== 'stompedyou') {
      throw new UnauthorizedException('Invalid token');
    }
    return { status: 'pong', client: 'iStompedYou' };
  }
}
