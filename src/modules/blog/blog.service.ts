import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { Drizzle } from "src/db/drizzle.service";
import { blogsTable, GetBlogSchema } from "src/db/schema";
import { CreateBlogDTO, UpdateBlogDTO } from "./dto/blog.dto";

@Injectable()
export class BlogService {
  constructor(private readonly db: Drizzle) {}

  async getAllBlogs(): Promise<GetBlogSchema[]> {
    const data = await this.db.getDrizzleDB().select().from(blogsTable);

    return data;
  }

  async getBlogById(id: number): Promise<GetBlogSchema> {
    const data = await this.db
      .getDrizzleDB()
      .select()
      .from(blogsTable)
      .where(eq(blogsTable.blogId, id));

    return data[0];
  }

  async createBlog(payload: CreateBlogDTO): Promise<GetBlogSchema[] | null> {
    const data = await this.db
      .getDrizzleDB()
      .insert(blogsTable)
      .values(payload)
      .returning();

    return data;
  }

  async updateBlog(
    payload: UpdateBlogDTO,
  ): Promise<GetBlogSchema[] | null | string> {
    const data = await this.db
      .getDrizzleDB()
      .update(blogsTable)
      .set(payload)
      .where(eq(blogsTable.blogId, payload.blogId))
      .returning();

    return data;
  }

  async deleteBlog(blog_id: number): Promise<string> {
    await this.db
      .getDrizzleDB()
      .delete(blogsTable)
      .where(eq(blogsTable.blogId, blog_id));

    return "Blog deleted successfully";
  }
}
