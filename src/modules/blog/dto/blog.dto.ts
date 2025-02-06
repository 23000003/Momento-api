import { ApiProperty } from "@nestjs/swagger";

class BlogDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  capturedMoment: string;

  @ApiProperty()
  semiCapturedMoment: string;

  @ApiProperty()
  postedbyId: number;
}

export class GetBlogDTO extends BlogDTO {
  @ApiProperty()
  blog_id: number;

  @ApiProperty()
  popularity: number;

  @ApiProperty()
  posted_at: Date;
}

export class CreateBlogDTO extends BlogDTO {}

export class UpdateBlogDTO extends BlogDTO {
  @ApiProperty()
  blogId: number;
}
