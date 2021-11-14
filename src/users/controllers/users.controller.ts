import { UsersService } from '../services/users.service';
import { HttpExceptionFilter } from '../../http-exception.filter';
import { UserRequestDto } from '../dto/users.request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Get()
  getCurrentUser() {
    return 'current user';
  }

  @Post()
  async signUp(@Body() body: UserRequestDto) {
    return await this.UsersService.signUp(body);
  }
}
