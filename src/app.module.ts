import { Module } from '@nestjs/common';
import { UserController } from './app.controller';
import { UserService } from './app.service';
import { MyGateway } from './gateway/my-gategay.gateway'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'oned',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]), 
  ],
  controllers: [UserController],
  providers: [UserService, MyGateway, UserController], 
})
export class AppModule {}
