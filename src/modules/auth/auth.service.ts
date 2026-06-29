import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly saltRounds = 12;

  async register(registerDto: CreateUsuarioDto) {
    const { contrasena, ...userData } = registerDto;

    await this.usuariosService.create({
      ...registerDto,
      contrasena: await bcrypt.hash(contrasena, this.saltRounds),
    });

    return { message: 'Usuario registrado exitosamente', data: userData };
  }

  async login(loginDto: LoginDto) {
    const { email, contrasena } = loginDto;
    const userFound = await this.usuariosService.findOneByEmail(email);

    if (!userFound) throw new NotFoundException('Usuario no encontrado');

    const isPasswordMatched = await bcrypt.compare(
      contrasena,
      userFound.contrasena,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena: _, ...userData } = userFound;

    const token = await this.getJwtToken({
      sub: userFound.id,
      email,
      rol: userFound.rol,
      filialId: userFound.filialId,
    });

    return { message: 'Usuario logueado exitosamente', data: userData, token };
  }

  async getJwtToken(payload: JwtPayload) {
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
