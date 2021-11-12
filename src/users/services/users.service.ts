import { User } from './../users.schema';
import { UserRequestDto } from './../dto/users.request.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async signUp(body: UserRequestDto) {
    const { email, name } = body;
    const isUserExist = await this.userModel.exists({ email });

    if (isUserExist) {
      throw new UnauthorizedException('해당하는 사용자는 이미 존재합니다.');
    }

    const user = await this.userModel.create({ email, name });

    return user;
  }
}
