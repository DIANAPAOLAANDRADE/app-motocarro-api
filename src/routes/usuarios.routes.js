const router = require("express").Router();

const c = require("../controllers/usuarios.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRole = require("../middleware/authorizeRole");
const authorizeOwnerOrAdmin = require("../middleware/authorizeOwnerOrAdmin");

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Gestión de usuarios
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios (solo administrador)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios sin contraseñas
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Se requiere rol administrador
 */
router.get(
  "/",
  verifyToken,
  authorizeRole("admin"),
  c.listar
);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Registrar una cuenta nueva
 *     description: El registro público crea usuarios con rol cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - documento
 *               - telefono
 *               - correo
 *               - contrasena
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               documento:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       409:
 *         description: Documento o correo ya registrado
 */
router.post("/", c.crear);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     tags: [Usuarios]
 *     summary: Iniciar sesión
 *     description: Devuelve un token JWT al autenticar las credenciales.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Faltan datos
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", c.login);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener la propia cuenta o consultar como administrador
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       403:
 *         description: No puedes acceder a otra cuenta
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/:id",
  verifyToken,
  authorizeOwnerOrAdmin,
  c.obtener
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar la propia cuenta o gestionar como administrador
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: No puedes modificar otra cuenta
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  "/:id",
  verifyToken,
  authorizeOwnerOrAdmin,
  c.actualizar
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar usuario (solo administrador)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Se requiere rol administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  c.eliminar
);

module.exports = router;