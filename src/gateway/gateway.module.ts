import { Module } from '@nestjs/common';
import { MyGateway } from './my-gategay.gateway';
// import { Mygateway } from './gateway';

@Module({
    providers: [MyGateway],
})
export class GatewayModule {} 