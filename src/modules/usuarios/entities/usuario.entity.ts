import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsuarioRol } from 'src/modules/usuarios/enums/usuario-rol.enum';
import { Filial } from 'src/modules/filial/entities/filial.entity';
import { Novedad } from 'src/modules/novedad/entities/novedad.entity';
import { Auditoria } from 'src/modules/auditoria/entities/auditoria.entity';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 160,
    nullable: false,
    unique: true,
  })
  email!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 160, nullable: false })
  nombre!: string;

  @Column({ name: 'contrasena', type: 'varchar', length: 255, nullable: false })
  contrasena!: string;

  @Column({
    name: 'rol',
    type: 'enum',
    enum: UsuarioRol,
    enumName: 'usuario_rol',
    nullable: false,
  })
  rol!: UsuarioRol;

  @Column({ name: 'filial_id', type: 'integer', nullable: false })
  filialId!: number;

  @ManyToOne(() => Filial, (filial) => filial.usuarios)
  @JoinColumn({ name: 'filial_id' })
  filial!: Filial;

  @ManyToOne(() => Usuario, (usuario) => usuario.subordinados, {
    nullable: true,
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor!: Usuario | null;

  @OneToMany(() => Usuario, (usuario) => usuario.supervisor)
  subordinados!: Usuario[];

  @OneToMany(() => Novedad, (novedad) => novedad.solicitante)
  novedadesSolicitadas!: Novedad[];

  @OneToMany(() => Novedad, (novedad) => novedad.aprobador)
  novedadesAprobadas!: Novedad[];

  @OneToMany(() => Auditoria, (auditoria) => auditoria.actor)
  auditorias!: Auditoria[];

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn!: Date;

  @UpdateDateColumn({ name: 'actualizada_en' })
  actualizadaEn!: Date;
}
