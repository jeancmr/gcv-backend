import { Controller, Get, Query, Request } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { GetAuditoriaQueryDto } from './dto/get-auditoria-query.dto';
import type { RequestWithUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  findAll(
    @Query() query: GetAuditoriaQueryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.auditoriaService.findAll(query, req.user.filialId);
  }
}
