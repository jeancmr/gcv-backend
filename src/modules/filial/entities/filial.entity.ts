import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Novedad } from '../../novedad/entities/novedad.entity';
import { Auditoria } from '../../auditoria/entities/auditoria.entity';

@Entity({ name: 'filial' })
export class Filial {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 120, nullable: false })
  nombre!: string;

  @Column({
    name: 'codigo',
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
  })
  codigo!: string;

  @OneToMany(() => Usuario, (usuario) => usuario.filial)
  usuarios!: Usuario[];

  @OneToMany(() => Novedad, (novedad) => novedad.filial)
  novedades!: Novedad[];

  @OneToMany(() => Auditoria, (auditoria) => auditoria.filial)
  auditorias!: Auditoria[];

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn!: Date;

  @UpdateDateColumn({ name: 'actualizada_en' })
  actualizadaEn!: Date;
}
