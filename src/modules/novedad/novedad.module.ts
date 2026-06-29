import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Novedad } from './entities/novedad.entity';
import { NovedadController } from './novedad.controller';
import { NovedadService } from './novedad.service';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad])],
  controllers: [NovedadController],
  providers: [NovedadService],
})
export class NovedadModule {}
