# 

# \# API REST de Servicio de Motocarro

# 

# Proyecto desarrollado para la aplicación de servicio de motocarro en Buesaco, Nariño, como parte de la formación Tecnólogo en Análisis y Desarrollo de Software del SENA.

# 

# \## 1. Descripción

# 

# La API permite gestionar la información de usuarios, conductores, vehículos, servicios, pagos y calificaciones mediante servicios web REST.

# 

# \## 2. Tecnologías utilizadas

# 

# \- Node.js

# \- Express

# \- MySQL

# \- mysql2

# \- Swagger / OpenAPI

# \- JSON Web Token (JWT)

# \- bcryptjs

# \- dotenv

# \- CORS

# \- Git

# 

# \## 3. Módulos integrados

# 

# \- Usuarios: registro, autenticación y administración de usuarios.

# \- Conductores: gestión de la información de los conductores.

# \- Vehículos: consulta y administración de vehículos.

# \- Servicios: gestión de las solicitudes y estados de los servicios.

# \- Pagos: consulta y gestión de los pagos asociados a los servicios.

# \- Calificaciones: consulta y gestión de las calificaciones.

# 

# El acceso a las operaciones depende de la autenticación y los permisos configurados para cada módulo.

# 

# \## 4. Requisitos de instalación

# 

# Para ejecutar el proyecto se necesita:

# 

# \- Node.js instalado.

# \- Un servidor MySQL o MariaDB disponible.

# \- Una base de datos creada con las tablas requeridas por la aplicación.

# \- Las dependencias indicadas en `package.json`.

# 

# \## 5. Configuración

# 

# 1\. Instalar las dependencias:

# 

# &#x20;  ```bash

# &#x20;  npm install

# &#x20;  ```

# 

# 2\. Crear una copia de `.env.example` con el nombre `.env`.

# 

# 3\. Configurar en `.env` los datos correspondientes al servidor de base de datos, el nombre de la base, las credenciales y la clave privada para JWT.

# 

# 4\. Verificar que la base de datos y sus tablas estén disponibles antes de iniciar la API.

# 

# \*\*Importante:\*\* el archivo `.env` contiene configuración privada y no debe publicarse en GitHub.

# 

# \## 6. Ejecución

# 

# Iniciar la API con:

# 

# ```bash

# npm start

# ```

# 

# La configuración predeterminada utiliza el puerto 3000, salvo que se indique otro valor en `.env`.

# 

# \## 7. Direcciones locales

# 

# \- API: `http://localhost:3000`

# \- Comprobación de estado y conexión con la base de datos: `http://localhost:3000/api/health`

# \- Documentación Swagger: `http://localhost:3000/api-docs`

# 

# Estas direcciones son locales. Para acceder desde Internet se necesita desplegar la aplicación en un servidor y documentar la URL pública correspondiente.

# 

# \## 8. Rutas principales

# 

# \- `/api/usuarios`

# \- `/api/conductores`

# \- `/api/vehiculos`

# \- `/api/servicios`

# \- `/api/pagos`

# \- `/api/calificaciones`

# 

# Los métodos HTTP disponibles y los permisos correspondientes se pueden consultar en la documentación Swagger.

# 

# \## 9. Control de versiones

# 

# El código fuente se gestiona mediante Git. La publicación del repositorio remoto de GitHub debe realizarse una vez creado el repositorio y comprobado que no se incluyan archivos privados.

# 

# \## 10. Seguridad

# 

# La aplicación utiliza JWT para autenticación y bcryptjs para el manejo de contraseñas. Los permisos se controlan mediante middleware según las operaciones configuradas en las rutas.

# 

# No se deben publicar contraseñas, tokens, claves privadas ni credenciales de la base de datos.

# 

# \## 11. Estado de despliegue

# 

# La ejecución local permite realizar pruebas en el entorno de desarrollo. La URL pública de despliegue deberá registrarse cuando la aplicación esté disponible en un servidor accesible por Internet.

# 

