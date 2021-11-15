import { Injectable, Body } from '@nestjs/common';
import { InsertQueueDto } from './dto/token.dto';
import {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} from 'agora-access-token';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './room.schema';
import { Model } from 'mongoose';

@Injectable()
export class RoomService {
  roomInfo = Array.from({ length: 200 }, () => 0);
  static array_index: number = 0;
  appId: string = '363ca080f33f4346a7b5c1afbbfe34b6';
  appCertificate: string = '0b0f93340f5a4b33bb219807e4d8b89b';
  room_list = {};
  user_list:object = {};
  man_queue:object = {};
  total_human = 2;
  icon_list = ['whale','eagle','elephant','tutle','honey','koala']

  static request_success: boolean = false;

  constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

  insertQueue(obj: InsertQueueDto){
    if(!(obj['userId'] in this.user_list)){
      /** user_list 매칭 대기중인 user의 전체 리스트 0:방배점 못받음 표시 */
      this.user_list[obj['userId']] = 0;
      const UserId = obj['userId'];
      this.man_queue[UserId] = obj['nickname'];
    }

    /** insert될때마다 새로운 사람이 추가된거니까 인원이 충족한지 확인한다 */
    if(Object.keys(this.man_queue).length >= this.total_human){
      /** icon 할당 */
      const temp_icon = this.icon_list;
      const icon_insert = Object.entries(this.man_queue).slice(0,this.total_human);
      for(const member of icon_insert){
        this.man_queue[member[0]] = [this.man_queue[member[0]], temp_icon.pop()]
      }
      
      const room_member = Object.entries(this.man_queue).slice(0,this.total_human);
      this.man_queue = Object.entries(this.man_queue).slice(this.total_human);
      const new_channelname = 'channel1';
      
      this.room_list[new_channelname] = room_member;
      for(const member of room_member){
        this.token_create(`${member[0]}`, new_channelname);
      }
    }
  }

  checkQueue(user: object){
    if(Object.keys(this.user_list).length >0 && this.user_list[user['userId']] != 0){
      const temp = this.user_list[user['userId']];
      delete this.user_list[user['userId']];
      console.log('queuelist', this.man_queue);
      console.log('userlist:' , this.user_list);
      console.log('roomlist:' , this.room_list);
      return temp;
    }
    else{return {msg: 'fail'}}
  }

  token_create(userId: string, channel_name:string){
    let channelname: string = channel_name;
    const rtc_role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    const token = RtcTokenBuilder.buildTokenWithAccount(
      this.appId,
      this.appCertificate,
      channelname,
      userId,
      rtc_role,
      privilegeExpiredTs,
    );
    /** 방잡힌 user가 받을 정보 데이터 */
    this.user_list[userId] = {
      msg:'success',
      voice_token:token,
      chat_token:token, 
      agora_id: this.appId, 
      remain_time: '10',
      group_room_name: channelname,
      room_info : this.room_list[channelname]};
  }
}
