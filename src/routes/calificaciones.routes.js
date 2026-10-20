const router = require("express").Router();
const c = require("../controllers/calificaciones.controller");
const verifyToken = require("../middleware/verifyToken");

/**
 * @swagger
 * tags:
 *   - name: Calificaciones
 *     description: Gestión de calificaciones
 */

/**
 * @swagger
 * /api/calificaciones:
 *   get:
 *     summary: Listar todas las calificaciones
 *     tags: [Calificaciones]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de calificaciones
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verifyToken, c.listar);

/**
 * @swagger
 * /api/calificaciones:
 *   post:
 *     summary: Crear una calificación
 *     tags: [Calificaciones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_servicio
 *               - id_usuario
 *               - puntuacion
 *             properties:
 *               id_servicio:
 *                 type: integer
 *                 example: 1
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               puntuacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 example: Excelente servicio
 *     responses:
 *       201:
 *         description: Calificación creada
 *       400:
 *         description: Datos incorrectos
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post("/", verifyToken, c.crear);

/**
 * @swagger
 * /api/calificaciones/{id}:
 *   get:
 *     summary: Obtener calificación por ID
 *     tags: [Calificaciones]
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
 *         description: Calificación encontrada
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Calificación no encontrada
 */
router.get("/:id", verifyToken, c.obtener);

/**
 * @swagger
 * /api/calificaciones/{id}:
 *   put:
 *     summary: Actualizar calificación
 *     tags: [Calificaciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_servicio
 *               - id_usuario
 *               - puntuacion
 *             properties:
 *               id_servicio:
 *                 type: integer
 *               id_usuario:
 *                 type: integer
 *               puntuacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Calificación actualizada
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Calificación no encontrada
 */
router.put("/:id", verifyToken, c.actualizar);

/**
 * @swagger
 * /api/calificaciones/{id}:
 *   delete:
 *     summary: Eliminar calificación
 *     tags: [Calificaciones]
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
 *         description: Calificación eliminada
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Calificación no encontrada
 */
router.delete("/:id", verifyToken, c.eliminar);

module.exports = router;