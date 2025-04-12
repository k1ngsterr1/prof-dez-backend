import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || '123',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [PrismaService], // <-- ДОБАВЬ ЭТО
  exports: [JwtModule, PrismaService],
})
export class SharedModule {}
