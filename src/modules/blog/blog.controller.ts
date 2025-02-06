import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import { CreateBlogDTO, UpdateBlogDTO } from "./dto/blog.dto";

@Controller("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllBlogs() {
    const data = await this.blogService.getAllBlogs();
    return data;
  }

  @Get("/view/:blogId")
  async getBlogById(blogId: number) {
    const data = await this.blogService.getBlogById(blogId);
    return data;
  }

  @Post("publish-blog")
  async createBlog(@Body() payload: CreateBlogDTO) {
    const data = await this.blogService.createBlog(payload);
    return data;
  }

  @Patch("update-blog/:blogId")
  async updateBlog(
    @Param("blogId") blogId: string,
    @Body() payload: UpdateBlogDTO,
  ) {
    const data = await this.blogService.updateBlog(payload);
    return data;
  }

  @Delete("delete-blog/:blogId")
  async deleteBlog(@Param("blogId") blogId: string) {
    const data = await this.blogService.deleteBlog(parseInt(blogId));
    return data;
  }
}
