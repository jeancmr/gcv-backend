import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Filial } from 'src/modules/filial/entities/filial.entity';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { AuditoriaAccion } from '../enums/auditoria-accion.enum';

@Entity({ name: 'auditoria' })
export class Auditoria {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.auditorias, {
    nullable: false,
  })
  @JoinColumn({ name: 'actor_id' })
  actor!: Usuario;

  @ManyToOne(() => Filial, (filial) => filial.auditorias, {
    nullable: false,
  })
  @JoinColumn({ name: 'filial_id' })
  filial!: Filial;

  @Column({ name: 'accion', type: 'varchar', length: 40 })
  accion!: AuditoriaAccion;

  @Column({ name: 'entidad', type: 'varchar', length: 40 })
  entidad!: string;

  @Column({ name: 'entidad_id', type: 'bigint', nullable: true })
  entidadId!: string | null;

  @Column({ name: 'detalle', type: 'jsonb', nullable: true })
  detalle!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn!: Date;
}
