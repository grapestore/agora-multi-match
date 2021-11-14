import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Room extends Document {

  @Prop()
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

}

export const RoomSchema = SchemaFactory.createForClass(Room);
