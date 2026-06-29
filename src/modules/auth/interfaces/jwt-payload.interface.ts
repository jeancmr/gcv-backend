import { Request } from 'express';
import { UsuarioRol } from 'src/modules/usuarios/enums/usuario-rol.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: UsuarioRol;
  filialId: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
