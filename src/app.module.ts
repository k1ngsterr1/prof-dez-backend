import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [ProductModule, UserModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
