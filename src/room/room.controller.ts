import { Controller, Post, Body, Get, ConsoleLogger } from '@nestjs/common';
import { InsertQueueDto } from './dto/token.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {

  constructor(private roomService: RoomService){}

  @Post('/entrance')
  insertQueue(@Body() req: InsertQueueDto): string{
    this.roomService.insertQueue(req);
    return 'success'
  }

  @Post('/checkqueue')
  checkQueue(@Body() user: object):object{
    console.log(user);
    return this.roomService.checkQueue(user);
  }
}
