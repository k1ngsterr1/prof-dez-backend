import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { CategoryModule } from './category/category.module';
import { SubcategoryModule } from './subcategory/subcategory.module';

@Module({
  imports: [ProductModule, UserModule, SharedModule, CategoryModule, SubcategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
