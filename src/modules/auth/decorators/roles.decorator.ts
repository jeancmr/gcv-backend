// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UsuarioRol } from '../../usuarios/enums/usuario-rol.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UsuarioRol[]) => SetMetadata(ROLES_KEY, roles);
