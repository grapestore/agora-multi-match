import { IsNotEmpty } from "class-validator";


export class CreateTokenDto{

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  userId: string;

}