import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Supabase } from 'src/db/supabase.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, Supabase]
})
export class BlogModule {}
