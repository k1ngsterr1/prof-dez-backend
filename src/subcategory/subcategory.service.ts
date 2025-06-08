import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class SubcategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubcategoryDto) {
    return this.prisma.subcategory.create({ data: dto });
  }

  async findAll() {
    return this.prisma.subcategory.findMany({ include: { category: true } });
  }

  async findOne(id: number) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!subcategory) throw new NotFoundException('Subcategory not found');
    return subcategory;
  }

  async update(id: number, dto: UpdateSubcategoryDto) {
    return this.prisma.subcategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.subcategory.delete({
      where: { id },
    });
  }
}
