const router = require("express").Router();
const c = require("../controllers/conductores.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRole = require("../middleware/authorizeRole");

/**
 * @swagger
 * tags:
 *   - name: Conductores
 *     description: Gestión de conductores
 */

/**
 * @swagger
 * /api/conductores:
 *   get:
 *     summary: Listar conductores
 *     tags: [Conductores]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conductores
 *       401:
 *         description: Token no válido
 */
router.get("/", verifyToken, c.listar);

/**
 * @swagger
 * /api/conductores:
 *   post:
 *     summary: Crear conductor (solo administrador)
 *     tags: [Conductores]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - licencia
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 example: 4
 *               licencia:
 *                 type: string
 *                 example: LIC202610
 *               estado:
 *                 type: string
 *                 example: Disponible
 *     responses:
 *       201:
 *         description: Conductor creado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Se requiere rol administrador
 */
router.post(
  "/",
  verifyToken,
  authorizeRole("admin"),
  c.crear
);

/**
 * @swagger
 * /api/conductores/{id}:
 *   get:
 *     summary: Obtener conductor por ID
 *     tags: [Conductores]
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
 *         description: Conductor encontrado
 *       401:
 *         description: Token no válido
 *       404:
 *         description: Conductor no encontrado
 */
router.get("/:id", verifyToken, c.obtener);

/**
 * @swagger
 * /api/conductores/{id}:
 *   put:
 *     summary: Actualizar conductor (solo administrador)
 *     tags: [Conductores]
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
 *         description: Conductor actualizado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Se requiere rol administrador
 *       404:
 *         description: Conductor no encontrado
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  c.actualizar
);

/**
 * @swagger
 * /api/conductores/{id}:
 *   delete:
 *     summary: Eliminar conductor (solo administrador)
 *     tags: [Conductores]
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
 *         description: Conductor eliminado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Se requiere rol administrador
 *       404:
 *         description: Conductor no encontrado
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  c.eliminar
);

module.exports = router;