import { Controller, Get, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import type { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.usuariosService.findAll(req.user.filialId);
  }
}
