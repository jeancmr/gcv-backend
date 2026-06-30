import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Novedad } from './entities/novedad.entity';
import { NovedadController } from './novedad.controller';
import { NovedadService } from './novedad.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad]), AuditoriaModule],
  controllers: [NovedadController],
  providers: [NovedadService],
})
export class NovedadModule {}
