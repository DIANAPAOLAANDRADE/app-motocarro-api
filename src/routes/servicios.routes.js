
const router = require("express").Router();
const c = require("../controllers/servicios.controller");
const verifyToken = require("../middleware/verifyToken");

/**
 * @swagger
 * tags:
 *   - name: Servicios
 *     description: Gestión de servicios de motocarro
 */

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     summary: Listar todos los servicios
 *     tags: [Servicios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verifyToken, c.listar);

/**
 * @swagger
 * /api/servicios:
 *   post:
 *     summary: Crear un servicio
 *     tags: [Servicios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Servicio creado
 *       400:
 *         description: Datos incorrectos
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post("/", verifyToken, c.crear);

/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags: [Servicios]
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
 *         description: Servicio encontrado
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Servicio no encontrado
 */
router.get("/:id", verifyToken, c.obtener);

/**
 * @swagger
 * /api/servicios/{id}:
 *   put:
 *     summary: Actualizar un servicio
 *     tags: [Servicios]
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
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Servicio no encontrado
 */
router.put("/:id", verifyToken, c.actualizar);

/**
 * @swagger
 * /api/servicios/{id}:
 *   delete:
 *     summary: Eliminar un servicio
 *     tags: [Servicios]
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
 *         description: Servicio eliminado
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Servicio no encontrado
 */
router.delete("/:id", verifyToken, c.eliminar);

module.exports = router;
