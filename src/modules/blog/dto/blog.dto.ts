import { ApiProperty } from "@nestjs/swagger";

class BlogDTO {
    @ApiProperty()
    title: string;
    
    @ApiProperty()
    content: string;
    
    @ApiProperty()
    captured_moment: string;
    
    @ApiProperty()
    semi_captured_moment: string;
    
    @ApiProperty()
    user_id: number;
}

export class GetBlogDTO extends BlogDTO {
    @ApiProperty()
    blog_id: number;

    @ApiProperty()
    popularity: number;

    @ApiProperty()
    posted_at: Date;
}

export class CreateBlogDTO extends BlogDTO { }

export class UpdateBlogDTO extends BlogDTO {
    @ApiProperty()
    blog_id: number;
}
