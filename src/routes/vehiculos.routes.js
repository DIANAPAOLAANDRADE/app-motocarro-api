const router = require("express").Router();
const c = require("../controllers/vehiculos.controller");
const verifyToken = require("../middleware/verifyToken");
const authorizeRole = require("../middleware/authorizeRole");

/**
 * @swagger
 * tags:
 *   - name: Vehículos
 *     description: Gestión de vehículos de motocarro
 */

/**
 * @swagger
 * /api/vehiculos:
 *   get:
 *     summary: Listar vehículos
 *     tags: [Vehículos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/", verifyToken, c.listar);

/**
 * @swagger
 * /api/vehiculos:
 *   post:
 *     summary: Crear vehículo (solo administrador)
 *     tags: [Vehículos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_conductor
 *               - placa
 *               - marca
 *             properties:
 *               id_conductor:
 *                 type: integer
 *                 example: 1
 *               placa:
 *                 type: string
 *                 example: ABC123
 *               marca:
 *                 type: string
 *                 example: AKT
 *               modelo:
 *                 type: string
 *                 example: "2026"
 *               color:
 *                 type: string
 *                 example: Rojo
 *               estado:
 *                 type: string
 *                 example: Disponible
 *     responses:
 *       201:
 *         description: Vehículo creado
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
 * /api/vehiculos/{id}:
 *   get:
 *     summary: Obtener vehículo por ID
 *     tags: [Vehículos]
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
 *         description: Vehículo encontrado
 *       404:
 *         description: Vehículo no encontrado
 */
router.get("/:id", verifyToken, c.obtener);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   put:
 *     summary: Actualizar vehículo (solo administrador)
 *     tags: [Vehículos]
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
 *         description: Vehículo actualizado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Se requiere rol administrador
 *       404:
 *         description: Vehículo no encontrado
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  c.actualizar
);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   delete:
 *     summary: Eliminar vehículo (solo administrador)
 *     tags: [Vehículos]
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
 *         description: Vehículo eliminado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Se requiere rol administrador
 *       404:
 *         description: Vehículo no encontrado
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  c.eliminar
);

module.exports = router;