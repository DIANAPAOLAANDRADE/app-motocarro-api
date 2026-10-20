const router = require("express").Router();
const c = require("../controllers/pagos.controller");
const verifyToken = require("../middleware/verifyToken");

/**
 * @swagger
 * tags:
 *   - name: Pagos
 *     description: Gestión de pagos de los servicios de motocarro
 */

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Listar todos los pagos
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verifyToken, c.listar);

/**
 * @swagger
 * /api/pagos/{id}:
 *   get:
 *     summary: Obtener un pago por ID
 *     tags: [Pagos]
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
 *         description: Pago encontrado
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Pago no encontrado
 */
router.get("/:id", verifyToken, c.obtener);

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Crear un pago
 *     tags: [Pagos]
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
 *               - metodo_pago
 *               - valor
 *             properties:
 *               id_servicio:
 *                 type: integer
 *                 example: 1
 *               metodo_pago:
 *                 type: string
 *                 example: Efectivo
 *               valor:
 *                 type: number
 *                 example: 15000
 *     responses:
 *       201:
 *         description: Pago creado
 *       400:
 *         description: Datos incorrectos
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post("/", verifyToken, c.crear);

/**
 * @swagger
 * /api/pagos/{id}/estado:
 *   put:
 *     summary: Actualizar el estado de un pago
 *     tags: [Pagos]
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
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 example: Pagado
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Pago no encontrado
 */
router.put("/:id/estado", verifyToken, c.actualizarEstado);

module.exports = router;