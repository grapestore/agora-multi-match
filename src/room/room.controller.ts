import { Controller, Post, Body, Get, ConsoleLogger } from '@nestjs/common';
import { CreateTokenDto } from './dto/token.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {

  constructor(private roomService: RoomService){}

  // @Post('/entrance')
  // insertQueue(@Body() req: object): string{
  //   this.roomService.insertQueue(req);
  //   //console.log('hello');
  //   return 'success'
  // }

  // @Post('/checkqueue')
  // checkQueue(@Body() user: object):object{
    
  //   return this.roomService.checkQueue(user);
  // }
}
