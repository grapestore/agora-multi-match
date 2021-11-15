import { IsNotEmpty } from "class-validator";


export class InsertQueueDto{

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  userId: string;

}