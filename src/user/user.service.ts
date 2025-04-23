import {
  Injectable,
  NotFoundException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { FormDto } from './dto/form.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async signToken(user: User, expiresIn = '1d') {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload, {
      expiresIn,
      secret: process.env.JWT_SECRET,
    });
  }

  private async signRefreshToken(user: User) {
    return this.signToken(user, '7d');
  }

  private async returnWithTokens(user: User) {
    const accessToken = await this.signToken(user);
    const refreshToken = await this.signRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  /**
   * Register or activate a user by setting password
   */
  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (user) {
      throw new HttpException('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const updatedUser = await this.prisma.user.create({
      data: {
        password: hashedPassword,
        email: createUserDto.email,
        role: createUserDto.role,
      },
    });

    return this.returnWithTokens(updatedUser);
  }

  async sendForm(data: FormDto) {
    const { name, email, phone, subject, message } = data;
    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Подтверждение запроса на покупку</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; color: #333333;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0; background-color: #f4f4f4;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; border: 1px solid #dddddd; border-spacing: 0; text-align: left; background-color: #ffffff;">
                        <!-- Шапка -->
                        <tr>
                            <td style="padding: 30px 30px 20px 30px; background-color: #2389ff;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0;">
                                    <tr>
                                        <td style="padding: 0; width: 100%;" align="center">
                                            <h1 style="margin: 0; font-size: 24px; line-height: 28px; font-weight: bold; color: #ffffff;">PROFDEZ.kz</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Основное содержание -->
                        <tr>
                            <td style="padding: 30px 30px 20px 30px; background-color: #ffffff;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0;">
                                    <tr>
                                        <td style="padding: 0 0 20px 0; border-bottom: 1px solid #eeeeee;">
                                            <h2 style="margin: 0 0 10px 0; font-size: 20px; line-height: 26px; font-weight: bold; color: #333333;">Новый запрос на покупку</h2>
                                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #666666;">
                                                Поступил новый запрос на покупку со следующими данными:
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Информация о клиенте -->
                                    <tr>
                                        <td style="padding: 20px 0 0 0;">
                                            <h3 style="margin: 0 0 15px 0; font-size: 18px; line-height: 24px; font-weight: bold; color: #333333;">Информация о клиенте</h3>
                                            
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0;">
                                                <tr>
                                                    <td style="padding: 5px 0; width: 30%; color: #666666; font-weight: bold;">Имя:</td>
                                                    <td style="padding: 5px 0; width: 70%; color: #333333;">${name}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px 0; width: 30%; color: #666666; font-weight: bold;">Email:</td>
                                                    <td style="padding: 5px 0; width: 70%; color: #333333;">${email}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px 0; width: 30%; color: #666666; font-weight: bold;">Телефон:</td>
                                                    <td style="padding: 5px 0; width: 70%; color: #333333;">${phone}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    
                                    <!-- Детали запроса -->
                                    <tr>
                                        <td style="padding: 20px 0 0 0;">
                                            <h3 style="margin: 0 0 15px 0; font-size: 18px; line-height: 24px; font-weight: bold; color: #333333;">Детали запроса</h3>
                                            
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0;">
                                                <tr>
                                                    <td style="padding: 5px 0; width: 30%; color: #666666; font-weight: bold;">Тема:</td>
                                                    <td style="padding: 5px 0; width: 70%; color: #333333;">${subject}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px 0; width: 30%; color: #666666; font-weight: bold; vertical-align: top;">Сообщение:</td>
                                                    <td style="padding: 5px 0; width: 70%; color: #333333;">${message}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Следующие шаги -->
                        <tr>
                            <td style="padding: 20px 30px; background-color: #f8f8f8; border-top: 1px solid #dddddd;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0;">
                                    <tr>
                                        <td style="padding: 0; color: #333333;">
                                            <h3 style="margin: 0 0 10px 0; font-size: 18px; line-height: 24px; font-weight: bold;">Следующие шаги</h3>
                                            <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 24px;">
                                                Наша команда рассмотрит ваш запрос и свяжется с вами в ближайшее время. Если у вас возникли срочные вопросы, пожалуйста, свяжитесь с нами напрямую.
                                            </p>
                                            <p style="margin: 0; font-size: 16px; line-height: 24px;">
                                                <a href="tel:+77000246777" style="color: #2389ff; text-decoration: none; font-weight: bold;">+7(700) 024-67-77</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Подвал -->
                        <tr>
                            <td style="padding: 30px; background-color: #333333;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0; font-size: 14px; color: #ffffff;">
                                    <tr>
                                        <td style="padding: 0; width: 50%;" align="left">
                                            <p style="margin: 0; font-size: 14px; line-height: 20px;">
                                                &copy; PROFDEZ.kz 2024<br/>
                                                Профессиональные дезинфицирующие средства
                                            </p>
                                        </td>
                                        <td style="padding: 0; width: 50%;" align="right">
                                            <table role="presentation" style="border-collapse: collapse; border: 0; border-spacing: 0;">
                                                <tr>
                                                    <td style="padding: 0;">
                                                        <p style="margin: 0; font-size: 14px; line-height: 20px;">
                                                            Email: <a href="mailto:info@profdez.kz" style="color: #ffffff; text-decoration: underline;">info@profdez.kz</a><br/>
                                                            Телефон: +7(700) 024-67-77
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const transporter = nodemailer.createTransport({
      pool: true,
      host: 'pkz66.hoster.kz',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(process.env.EMAIL_USER);

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'erlanzh.gg@gmail.com',
      subject: 'Форма для связи профдез',
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    return { message: 'Form sent successfully' };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.returnWithTokens(user);
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
