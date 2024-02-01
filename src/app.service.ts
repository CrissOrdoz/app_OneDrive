import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveFolder(folderId:string, name: string): Promise<User> {
    const user = new User();
    user.folderId = folderId;
    user.name = name;

    return await this.userRepository.save(user);
  }

  async findFolderById(folderId: string): Promise<boolean> {
    const folder = await this.userRepository.findOne({ where: { folderId: folderId } });
    console.log(folder, !!folder);
    return !!folder;
  }

  
}
