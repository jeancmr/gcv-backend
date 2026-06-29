import { UsuarioRol } from '../../../modules/usuarios/enums/usuario-rol.enum';

export default [
  {
    id: 1,
    email: 'sergio.super@and.gcv.com',
    nombre: 'Sergio Paez',
    rol: UsuarioRol.SUPERVISOR,
    filial_id: 1,
  },
  {
    id: 2,
    email: 'carla.colaborador@and.gcv.com',
    nombre: 'Carla Nunez',
    rol: UsuarioRol.COLABORADOR,
    filial_id: 1,
    supervisor_id: 1,
  },

  {
    id: 3,
    email: 'rocio.rrhh@and.gcv.com',
    nombre: 'Rocio Velez',
    rol: UsuarioRol.RRHH,
    filial_id: 1,
  },
  {
    id: 4,
    email: 'sandra.super@ret.gcv.com',
    nombre: 'Sandra Ortiz',
    rol: UsuarioRol.SUPERVISOR,
    filial_id: 2,
  },
  {
    id: 5,
    email: 'diego.colaborador@ret.gcv.com',
    nombre: 'Diego Mora',
    rol: UsuarioRol.COLABORADOR,
    filial_id: 2,
    supervisor_id: 4,
  },
  {
    id: 6,
    email: 'raul.rrhh@ret.gcv.com',
    nombre: 'Raul Bermudez',
    rol: UsuarioRol.RRHH,
    filial_id: 2,
  },
];
