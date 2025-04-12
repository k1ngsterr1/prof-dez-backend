import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register or activate a user by setting password
   */
  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (!user) {
      throw new HttpException(
        'User not found. Please verify your email first.',
        400,
      );
    }

    if (user.password) {
      throw new HttpException('Password already set. Try logging in.', 400);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.update({
      where: { email: createUserDto.email },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Get all users
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get one user by ID
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user by ID
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Will throw if user doesn't exist

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  /**
   * Delete user by ID
   */
  async remove(id: number) {
    await this.findOne(id); // Will throw if not found
    return this.prisma.user.delete({ where: { id } });
  }
}
