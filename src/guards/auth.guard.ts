import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { Supabase } from "src/db/supabase.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Supabase) private readonly supabase: Supabase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    console.log(request.headers);

    //test
    const { data } = await this.supabase
      .getSupabase()
      .from("testusers")
      .select("*");

    console.log(data);

    throw new UnauthorizedException("Unauthorizedww");
  }
}
