import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilialController } from './filial.controller';
import { FilialService } from './filial.service';
import { Filial } from './entities/filial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Filial])],
  controllers: [FilialController],
  providers: [FilialService],
})
export class FilialModule {}
