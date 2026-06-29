import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { FilialService } from '../filial/filial.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioRol } from './enums/usuario-rol.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly filialService: FilialService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    let supervisor: Usuario | null = null;

    const userFound = await this.findOneByEmail(createUsuarioDto.email);

    if (userFound) throw new ConflictException('Usuario ya existe');

    const filialFound = await this.filialService.findOneById(
      createUsuarioDto.filialId,
    );

    if (!filialFound) throw new NotFoundException('Filial no encontrada');

    if (createUsuarioDto.supervisorEmail) {
      supervisor = await this.findOneByEmail(createUsuarioDto.supervisorEmail);

      if (!supervisor || supervisor.filialId !== createUsuarioDto.filialId) {
        throw new NotFoundException('Supervisor no encontrado');
      }

      if (supervisor.rol !== UsuarioRol.SUPERVISOR) {
        throw new ConflictException(
          'El usuario especificado no es un supervisor',
        );
      }
    }

    const newUsuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      supervisor: supervisor || null,
    });

    await this.usuarioRepository.save(newUsuario);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...userCreated } =
      await this.usuarioRepository.save(newUsuario);

    return userCreated;
  }

  async findAll(filialId: number) {
    const users = await this.usuarioRepository.find({
      where: { filialId },
    });

    return users;
  }

  async findOneByEmail(email: string) {
    return await this.usuarioRepository.findOneBy({ email });
  }
}
