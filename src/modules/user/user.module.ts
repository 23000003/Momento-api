import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Supabase } from 'src/db/supabase.service';

@Module({
  controllers: [UserController],
  providers: [UserService, Supabase]
})
export class UserModule {}
