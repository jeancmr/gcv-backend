import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NovedadService } from './novedad.service';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { GetNovedadesQueryDto } from './dto/get-novedades-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/enums/usuario-rol.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApproveNovedadesDto } from './dto/approve-novedades.dto';
import type { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';
import { UpdateNovedadDto } from './dto/update-novedad.dto';

@Controller('novedad')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NovedadController {
  constructor(private readonly novedadService: NovedadService) {}

  @Post()
  @Roles(UsuarioRol.COLABORADOR)
  crearNovedad(
    @Body() createNovedadDto: CreateNovedadDto,
    @Request() req: RequestWithUser,
  ) {
    return this.novedadService.create(createNovedadDto, req.user);
  }

  @Patch(':id')
  @Roles(UsuarioRol.COLABORADOR)
  updateNovedad(
    @Param('id') id: number,
    @Body() updateNovedadDto: UpdateNovedadDto,
    @Request() req: RequestWithUser,
  ) {
    return this.novedadService.update(id, updateNovedadDto, req.user);
  }

  @Get()
  findAll(
    @Query() query: GetNovedadesQueryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.novedadService.findAll(query, req.user);
  }

  @Get('stats')
  findAllStats(@Request() req: RequestWithUser) {
    return this.novedadService.findAllStats(req.user);
  }

  @Post('/:id/enviar')
  @Roles(UsuarioRol.COLABORADOR)
  enviarNovedad(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.novedadService.postRequest(id, req.user);
  }

  @Post('/:id/aprobar')
  @Roles(UsuarioRol.SUPERVISOR)
  aprobarNovedad(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.novedadService.aproveRequest(id, req.user);
  }

  @Post('/:id/rechazar')
  @Roles(UsuarioRol.SUPERVISOR)
  rechazarNovedad(@Param('id') id: number, @Request() req: RequestWithUser) {
    return this.novedadService.denyRequest(id, req.user);
  }

  @Post('/aprobar-masivo')
  @Roles(UsuarioRol.SUPERVISOR)
  aprobarMasivo(
    @Body() dto: ApproveNovedadesDto,
    @Request() req: RequestWithUser,
  ) {
    return this.novedadService.aproveRequestMassive(dto.ids, req.user);
  }
}
