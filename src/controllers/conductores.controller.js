
const db = require("../config/db");

// Listar todos los conductores
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id_conductor,
        c.id_usuario,
        c.licencia,
        c.estado,
        c.fecha_registro,
        u.nombre,
        u.telefono,
        u.correo
      FROM conductores c
      INNER JOIN usuarios u
        ON u.id_usuario = c.id_usuario
      ORDER BY c.id_conductor DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Consultar conductor por ID
exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM conductores WHERE id_conductor = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Conductor no encontrado"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// Crear conductor
exports.crear = async (req, res, next) => {
  try {
    const { id_usuario, licencia, estado } = req.body;

    if (!id_usuario || !licencia) {
      return res.status(400).json({
        mensaje: "id_usuario y licencia son obligatorios"
      });
    }

    const [result] = await db.query(
      `INSERT INTO conductores
       (id_usuario, licencia, estado)
       VALUES (?, ?, ?)`,
      [id_usuario, licencia, estado || "Disponible"]
    );

    res.status(201).json({
      id_conductor: result.insertId,
      mensaje: "Conductor creado"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar conductor
exports.actualizar = async (req, res, next) => {
  try {
    const { id_usuario, licencia, estado } = req.body;

    if (!id_usuario || !licencia || !estado) {
      return res.status(400).json({
        mensaje: "id_usuario, licencia y estado son obligatorios"
      });
    }

    const [result] = await db.query(
      `UPDATE conductores
       SET id_usuario = ?, licencia = ?, estado = ?
       WHERE id_conductor = ?`,
      [id_usuario, licencia, estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Conductor no encontrado"
      });
    }

    res.json({ mensaje: "Conductor actualizado" });
  } catch (error) {
    next(error);
  }
};

// Eliminar conductor
exports.eliminar = async (req, res, next) => {
  try {
    const [result] = await db.query(
      "DELETE FROM conductores WHERE id_conductor = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Conductor no encontrado"
      });
    }

    res.json({ mensaje: "Conductor eliminado" });
  } catch (error) {
    next(error);
  }
};
