import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import AppDataSource from '../data-source';

import { Filial } from '../../modules/filial/entities/filial.entity';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity';

import filiales from './data/filial.data';
import usuarios from './data/usuario.data';

async function seed() {
  await AppDataSource.initialize();

  const filialRepository = AppDataSource.getRepository(Filial);
  const usuarioRepository = AppDataSource.getRepository(Usuario);

  const saltRounds = 12;
  const DEFAULT_PASSWORD = 'Prueba2026*';
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);

  // asignar filiales
  for (const filial of filiales) {
    const newFilial = filialRepository.create(filial);
    await filialRepository.save(newFilial);
  }

  // asignar usuarios
  for (const usuario of usuarios) {
    const newUsuario = usuarioRepository.create({
      ...usuario,
      contrasena: hashedPassword,
      filialId: usuario.filial_id,
    });
    await usuarioRepository.save(newUsuario);
  }

  // asignar supervisores
  const sergio = await usuarioRepository.findOne({
    where: { email: 'sergio.super@and.gcv.com' },
  });

  const carla = await usuarioRepository.findOne({
    where: { email: 'carla.colaborador@and.gcv.com' },
  });

  if (sergio && carla) {
    carla.supervisor = sergio;
    await usuarioRepository.save(carla);
  }

  const sandra = await usuarioRepository.findOne({
    where: { email: 'sandra.super@ret.gcv.com' },
  });

  const diego = await usuarioRepository.findOne({
    where: { email: 'diego.colaborador@ret.gcv.com' },
  });

  if (sandra && diego) {
    diego.supervisor = sandra;
    await usuarioRepository.save(diego);
  }

  await AppDataSource.destroy();
}

seed()
  .then(() => {
    console.log('Seed ejecutado correctamente');
  })
  .catch((error) => {
    console.error('Ocurrió un error durante el seeding:', error);
  });
