import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyGateway } from './gateway/my-gategay.gateway';
// import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports:[MyGateway],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
