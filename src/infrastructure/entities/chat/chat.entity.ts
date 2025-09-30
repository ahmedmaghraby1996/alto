// chat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Column,
  JoinColumn,
} from 'typeorm';


import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';
import { Message } from './messages.entity';

@Entity()
export class Chat extends AuditableEntity {
  

  @ManyToOne(() => User, (user) => user.client_chats)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ nullable: true })
  client_id: string;

  @ManyToOne(() => User, (user) => user.driver_chats)
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ nullable: true })
  driver_id: string;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
  @ManyToOne(() => Message)
  @JoinColumn({ name: 'last_message' })
  last_message: Message;
  @Column({nullable:true})
  last_message_id: string;
   

  constructor(partial: Partial<Chat>) {
    super();
    Object.assign(this, partial);
  }
}

