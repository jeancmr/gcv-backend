import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Filial } from '../../filial/entities/filial.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { NovedadTipo } from '../enums/novedad-tipo.enum';
import { NovedadEstado } from '../enums/novedad-estado.enum';

@Entity({ name: 'novedad' })
export class Novedad {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Filial, (filial) => filial.novedades, {
    nullable: false,
  })
  @JoinColumn({ name: 'filial_id' })
  filial!: Filial;

  @ManyToOne(() => Usuario, (usuario) => usuario.novedadesSolicitadas, {
    nullable: false,
  })
  @JoinColumn({ name: 'solicitante_id' })
  solicitante!: Usuario;

  @Column({ name: 'tipo', type: 'varchar', length: 30, nullable: false })
  tipo!: NovedadTipo;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 20,
    default: NovedadEstado.BORRADOR,
    nullable: false,
  })
  estado!: NovedadEstado;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: string | null;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.novedadesAprobadas, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'aprobador_id' })
  aprobador!: Usuario | null;

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn!: Date;

  @UpdateDateColumn({ name: 'actualizada_en' })
  actualizadaEn!: Date;
}
