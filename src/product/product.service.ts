import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,

        items: JSON.stringify(createProductDto.items),
      },
    });
  }

  async findAll(category?: string, subcategory?: string) {
    if (subcategory) {
      return this.prisma.product.findMany({
        where: {
          subcategories: {
            some: {
              name: {
                contains: subcategory,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }

    if (category) {
      return this.prisma.product.findMany({
        where: {
          categories: {
            some: {
              name: {
                contains: category,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }

    return this.prisma.product.findMany({
      include: { categories: true, subcategories: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id); // бросит 404, если не найден

    const { items, ...rest } = dto;

    const data: Prisma.ProductUpdateInput = {
      ...rest,
      items: items ? JSON.stringify(items) : undefined,
    };

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
