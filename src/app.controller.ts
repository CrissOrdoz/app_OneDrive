import { Body, Controller, Get, Post, forwardRef, Inject } from '@nestjs/common';
import { UserService } from './app.service';
import { MyGateway } from './gateway/my-gategay.gateway';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => MyGateway)) private readonly myGateway: MyGateway,
  ) {}
  
  @Post()
  async saveFolder( @Body('folderId') folderId: string, @Body('name') name: string) {
    const user = await this.userService.saveFolder(folderId ,name);
    return user;
  }
}