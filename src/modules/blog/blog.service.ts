import { Injectable, Logger } from "@nestjs/common";
import { Supabase } from "src/db/supabase.service";
import { CreateBlogDTO, GetBlogDTO, UpdateBlogDTO } from "./dto/blog.dto";

@Injectable()
export class BlogService {

    constructor(private readonly supabase: Supabase) {}

    async getAllBlogs() : Promise<GetBlogDTO[]> {
        const { data, error } = await this.supabase
            .getSupabase()
            .from("blogs")
            .select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async getBlogById(id: string) : Promise<GetBlogDTO[]> {
        const { data, error } = await this.supabase
            .getSupabase()
            .from("blogs")
            .select("*")
            .eq("blog_id", id);

        if (error) {
            throw new Error(error.message);
        }

        const passData : GetBlogDTO[] = data;

        return passData;
    }

    async createBlog(
        payload: CreateBlogDTO
    ) : Promise<
        GetBlogDTO[] | null
    > { 
        const { error } = await this.supabase
            .getSupabase()
            .from("blogs")
            .insert(payload);

        if (error) {
            throw new Error(error.message);
        }

        const { data } = await this.supabase
            .getSupabase()
            .from("blogs")
            .select("*")
            .order("blog_id", { ascending: false })

        return data;
    }

    async updateBlog(
        id: string, 
        payload: UpdateBlogDTO
    ) : Promise<
        GetBlogDTO[] | null | string
    > {
        const { error } = await this.supabase
            .getSupabase()
            .from("blogs")
            .update(payload)
            .eq("blog_id", id);

        if (error) {
            Logger.error(error);
            return error.message;
        }

        const { data } = await this.supabase
            .getSupabase()
            .from("blogs")
            .select("*")
            .eq("blog_id", id);

        return data;
    }

    async deleteBlog(blog_id: string) : Promise<string> {
        const { error } = await this.supabase
            .getSupabase()
            .from("blogs")
            .select("*")
            .eq("blog_id", blog_id);

        if (error) {
            Logger.error(error);
            return error.message;
        }

        return "Blog deleted successfully";
    }
}
