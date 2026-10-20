const db = require("../config/db");

// LISTAR TODOS LOS VEHÍCULOS
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM motocarros
      ORDER BY id_motocarro DESC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// OBTENER VEHÍCULO POR ID
exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM motocarros WHERE id_motocarro = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Vehículo no encontrado"
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// CREAR VEHÍCULO
exports.crear = async (req, res, next) => {
  try {
    const {
      id_conductor,
      placa,
      marca,
      modelo,
      color,
      estado
    } = req.body;

    if (!id_conductor || !placa || !marca) {
      return res.status(400).json({
        mensaje: "id_conductor, placa y marca son obligatorios"
      });
    }

    const [result] = await db.query(
      `INSERT INTO motocarros
       (id_conductor, placa, marca, modelo, color, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_conductor,
        placa,
        marca,
        modelo || null,
        color || null,
        estado || "Disponible"
      ]
    );

    return res.status(201).json({
      id_motocarro: result.insertId,
      mensaje: "Vehículo creado"
    });
  } catch (error) {
    next(error);
  }
};

// ACTUALIZAR VEHÍCULO
exports.actualizar = async (req, res, next) => {
  try {
    const {
      id_conductor,
      placa,
      marca,
      modelo,
      color,
      estado
    } = req.body;

    if (!id_conductor || !placa || !marca || !estado) {
      return res.status(400).json({
        mensaje: "id_conductor, placa, marca y estado son obligatorios"
      });
    }

    const [result] = await db.query(
      `UPDATE motocarros
       SET id_conductor = ?,
           placa = ?,
           marca = ?,
           modelo = ?,
           color = ?,
           estado = ?
       WHERE id_motocarro = ?`,
      [
        id_conductor,
        placa,
        marca,
        modelo || null,
        color || null,
        estado,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Vehículo no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Vehículo actualizado"
    });
  } catch (error) {
    next(error);
  }
};

// ELIMINAR VEHÍCULO
exports.eliminar = async (req, res, next) => {
  try {
    const [result] = await db.query(
      "DELETE FROM motocarros WHERE id_motocarro = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Vehículo no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Vehículo eliminado"
    });
  } catch (error) {
    next(error);
  }
};