import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const storage = diskStorage({
  destination: './uploads/products',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('product')
export class ProductController {
  base_url =
    process.env.NODE_ENV === 'production'
      ? 'https://profdez.kz'
      : 'http://localhost:6001';
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, { storage }))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: any[],
  ) {
    console.log(createProductDto);
    const imageFilenames = images?.map(
      (file) => `${this.base_url}/uploads/products/${file.filename}`,
    );
    return this.productService.create({
      ...createProductDto,
      images: imageFilenames,
    });
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, { storage }))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: any[],
  ) {
    const imageFilenames = images?.map(
      (file) => `${this.base_url}/uploads/products/${file.filename}`,
    );
    return this.productService.update(+id, {
      ...updateProductDto,
      images: imageFilenames,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
