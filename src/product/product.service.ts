import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // «Вытаскиваем» нужные поля, чтобы не растаскивать categoryIds/subcategoryIds в spread
    const {
      categoryIds,
      subcategoryIds = [],
      items,
      ...rest
    } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...rest,

        items: JSON.stringify(items),

        categories: {
          connect: categoryIds.map((id) => ({
            id: Number(id),
          })),
        },

        subcategories: {
          connect: subcategoryIds.map((id) => ({
            id: Number(id),
          })),
        },
      },
      include: {
        categories: true,
        subcategories: true,
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
        include: {
          categories: true,
          subcategories: true,
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
        include: {
          categories: true,
          subcategories: true,
        },
      });
    }

    return this.prisma.product.findMany({
      include: { categories: true, subcategories: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { categories: true, subcategories: true },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id); // бросит 404, если не найден

    const {
      categoryIds,
      subcategoryIds = [],
      items,
      ...rest
    } = UpdateProductDto;

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
