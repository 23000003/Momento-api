import { ApiProperty } from "@nestjs/swagger";

export class QuestDTO {
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    tokens: number;
}