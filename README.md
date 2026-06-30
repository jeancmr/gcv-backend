# GCV Platform API

## Requisitos

- **Node.js v24** o superior.
- **Docker** y **Docker Compose** instalados.

## Variables de entorno

Antes de iniciar el proyecto cree un archivo `.env` a partir de `.env.template`

## Levantar la base de datos

Con las variables de entorno configuradas inicie el contenedor de PostgreSQL:

```bash
docker compose up
```

## Ejecutar las migraciones

Una vez que la base de datos esté disponible ejecute las migraciones para crear la estructura de tablas:

```bash
npm run migration:run
```

Para revertir la última migración ejecutada:

```bash
npm run migration:revert
```

> **Nota:** Si desea reiniciar completamente la base de datos elimina los datos del contenedor y vuelve a ejecutar las migraciones antes de cargar el seed.

## Cargar datos iniciales

Después de ejecutar las migraciones cargue los datos iniciales ejecutando:

```bash
npm run seed
```

Este comando inserta la información base necesaria para utilizar la aplicación (usuarios, filiales)

## Ejecutar la aplicación

Una vez completados los pasos anteriores la aplicación estará lista para ejecutarse mediante los scripts correspondientes del proyecto.

## Tiempo estimado de desarrollo

| Funcionalidad                                                                           |     Tiempo |
| --------------------------------------------------------------------------------------- | ---------: |
| Configuración inicial del proyecto (PostgreSQL, contenedor Docker y configuración base) |     20 min |
| Creación de módulos y entidades                                                         |     30 min |
| Implementación de los servicios de Usuarios y Filiales                                  |     20 min |
| Autenticación (Registro, Inicio de sesión y JWT Guard)                                  |     35 min |
| Migraciones y datos semilla (Seed)                                                      | 1 h 10 min |
| Implementación de la lógica de negocio y validaciones de **Novedades**                  | 1 h 20 min |
| Implementación de transacciones para las operaciones de **Novedades**                   |     50 min |

**Tiempo total estimado:** **5 horas 5 minutos**

---

## Reglas de negocio

### Generales

- Todas las operaciones se encuentran restringidas por `filialId`; cada usuario únicamente puede acceder a la información correspondiente a su filial.
- Toda acción realizada sobre una **Novedad** genera un registro en la entidad **Auditoría**.

### Colaborador

- Es el único rol autorizado para crear novedades.
- Solo puede visualizar las novedades creadas por él mismo.
- Puede filtrar sus novedades por estado.
- Es el único que puede enviar una novedad para aprobación, cambiando su estado de **BORRADOR** a **PENDIENTE**.
- No tiene acceso a los endpoints de aprobación o rechazo.
- No puede enviar nuevamente una novedad que ya se encuentre en estado **PENDIENTE**, **APROBADA** o **RECHAZADA**.

### Supervisor

- Es el único rol autorizado para aprobar o rechazar novedades.
- Puede realizar aprobaciones masivas.
- Puede visualizar únicamente novedades en los estados:

  - **PENDIENTE**
  - **APROBADA**
  - **RECHAZADA**

- No tiene acceso a las novedades en estado **BORRADOR**.

### Recursos Humanos (RRHH)

- Tiene acceso únicamente de consulta sobre las novedades.
- Las novedades en estado **BORRADOR** no son visibles para este rol.

---

## Auditoría

Todas las acciones relevantes realizadas sobre una novedad quedan registradas en la entidad **Auditoría**.

Cada registro almacena:

- El usuario que ejecutó la acción.
- La filial (`filialId`) a la que pertenece.
- La acción realizada.
- La fecha y hora del evento.

Las acciones auditadas incluyen:

- Creación de una novedad.
- Envío de una novedad para aprobación (**BORRADOR → PENDIENTE**).
- Aprobación de una novedad.
- Rechazo de una novedad.
- Aprobación masiva de novedades.
