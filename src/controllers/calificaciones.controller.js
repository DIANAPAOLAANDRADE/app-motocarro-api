
const db = require("../config/db");

// Obtener el ID del conductor asociado al usuario.
async function obtenerIdConductor(idUsuario) {
  const [rows] = await db.query(
    "SELECT id_conductor FROM conductores WHERE id_usuario = ?",
    [idUsuario]
  );

  return rows.length > 0 ? rows[0].id_conductor : null;
}

// Validar el rol del usuario autenticado.
function validarRol(req, res) {
  const rolesValidos = ["admin", "conductor", "cliente"];

  if (!req.usuario || !rolesValidos.includes(req.usuario.rol)) {
    res.status(403).json({
      mensaje: "No tienes permisos para esta operación"
    });
    return false;
  }

  return true;
}

// LISTAR CALIFICACIONES SEGÚN EL ROL
exports.listar = async (req, res, next) => {
  try {
    if (!validarRol(req, res)) return;

    let sql = "SELECT c.* FROM calificaciones c";
    let parametros = [];

    if (req.usuario.rol === "cliente") {
      sql += " WHERE c.id_usuario = ?";
      parametros.push(req.usuario.id_usuario);
    } else if (req.usuario.rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(200).json([]);
      }

      sql += `
        INNER JOIN servicios s
          ON s.id_servicio = c.id_servicio
        WHERE s.id_conductor = ?
      `;

      parametros.push(idConductor);
    }

    sql += " ORDER BY c.id_calificacion DESC";

    const [rows] = await db.query(sql, parametros);

    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// OBTENER CALIFICACIÓN POR ID
exports.obtener = async (req, res, next) => {
  try {
    if (!validarRol(req, res)) return;

    let sql = "SELECT c.* FROM calificaciones c";
    const parametros = [req.params.id];

    if (req.usuario.rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(404).json({
          mensaje: "Calificación no encontrada"
        });
      }

      sql += `
        INNER JOIN servicios s
          ON s.id_servicio = c.id_servicio
        WHERE c.id_calificacion = ?
          AND s.id_conductor = ?
      `;

      parametros.push(idConductor);
    } else if (req.usuario.rol === "cliente") {
      sql += `
        WHERE c.id_calificacion = ?
          AND c.id_usuario = ?
      `;

      parametros.push(req.usuario.id_usuario);
    } else {
      sql += " WHERE c.id_calificacion = ?";
    }

    const [rows] = await db.query(sql, parametros);

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Calificación no encontrada"
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// CREAR CALIFICACIÓN: SOLO EL CLIENTE AUTENTICADO
exports.crear = async (req, res, next) => {
  try {
    if (!validarRol(req, res)) return;

    if (req.usuario.rol !== "cliente") {
      return res.status(403).json({
        mensaje: "Solo los clientes pueden crear calificaciones"
      });
    }

    const { id_servicio, puntuacion, comentario } = req.body;

    const puntuacionNumero = Number(puntuacion);

    if (
      !id_servicio ||
      puntuacion === undefined ||
      !Number.isInteger(puntuacionNumero) ||
      puntuacionNumero < 1 ||
      puntuacionNumero > 5
    ) {
      return res.status(400).json({
        mensaje:
          "Se requiere id_servicio y una puntuación entera entre 1 y 5"
      });
    }

    // Verificar que el servicio exista y pertenezca al cliente.
    const [servicios] = await db.query(
      `SELECT id_servicio, id_usuario, estado
       FROM servicios
       WHERE id_servicio = ?`,
      [id_servicio]
    );

    if (
      servicios.length === 0 ||
      Number(servicios[0].id_usuario) !==
        Number(req.usuario.id_usuario)
    ) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    // Solo se permiten calificaciones de servicios terminados.
    const estadoServicio = String(servicios[0].estado)
      .trim()
      .toLowerCase();

    if (!["finalizado", "completado"].includes(estadoServicio)) {
      return res.status(400).json({
        mensaje: "Solo puedes calificar un servicio terminado"
      });
    }

    // Evitar duplicar la calificación de un mismo servicio.
    const [existentes] = await db.query(
      `SELECT id_calificacion
       FROM calificaciones
       WHERE id_servicio = ?
         AND id_usuario = ?
       LIMIT 1`,
      [id_servicio, req.usuario.id_usuario]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        mensaje: "Ya calificaste este servicio"
      });
    }

    const [result] = await db.query(
      `INSERT INTO calificaciones
        (id_servicio, id_usuario, puntuacion, comentario)
       VALUES (?, ?, ?, ?)`,
      [
        id_servicio,
        req.usuario.id_usuario,
        puntuacionNumero,
        comentario || null
      ]
    );

    return res.status(201).json({
      id_calificacion: result.insertId,
      mensaje: "Calificación creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// ACTUALIZAR CALIFICACIÓN
exports.actualizar = async (req, res, next) => {
  try {
    if (!validarRol(req, res)) return;

    const id = req.params.id;
    const { puntuacion, comentario } = req.body;
    const puntuacionNumero = Number(puntuacion);

    if (
      puntuacion === undefined ||
      !Number.isInteger(puntuacionNumero) ||
      puntuacionNumero < 1 ||
      puntuacionNumero > 5
    ) {
      return res.status(400).json({
        mensaje: "La puntuación debe ser un entero entre 1 y 5"
      });
    }

    const [rows] = await db.query(
      `SELECT *
       FROM calificaciones
       WHERE id_calificacion = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Calificación no encontrada"
      });
    }

    const calificacion = rows[0];

    // Los clientes solo pueden actualizar sus propias calificaciones.
    if (
      req.usuario.rol === "cliente" &&
      Number(calificacion.id_usuario) !==
        Number(req.usuario.id_usuario)
    ) {
      return res.status(403).json({
        mensaje: "No puedes modificar calificaciones de otros usuarios"
      });
    }

    // Un conductor no puede modificar calificaciones.
    if (req.usuario.rol === "conductor") {
      return res.status(403).json({
        mensaje: "Los conductores no pueden modificar calificaciones"
      });
    }

    // El propietario y el servicio no cambian durante la actualización.
    const [result] = await db.query(
      `UPDATE calificaciones
       SET puntuacion = ?,
           comentario = ?
       WHERE id_calificacion = ?`,
      [
        puntuacionNumero,
        comentario === undefined
          ? calificacion.comentario
          : comentario || null,
        id
      ]
    );

    if (result.affectedRows === 0 && Number(calificacion.puntuacion) !== puntuacionNumero) {
      return res.status(404).json({
        mensaje: "Calificación no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Calificación actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// ELIMINAR CALIFICACIÓN
exports.eliminar = async (req, res, next) => {
  try {
    if (!validarRol(req, res)) return;

    if (req.usuario.rol === "conductor") {
      return res.status(403).json({
        mensaje: "Los conductores no pueden eliminar calificaciones"
      });
    }

    let sql = "DELETE FROM calificaciones WHERE id_calificacion = ?";
    const parametros = [req.params.id];

    // El cliente solamente puede eliminar su propia calificación.
    if (req.usuario.rol === "cliente") {
      sql += " AND id_usuario = ?";
      parametros.push(req.usuario.id_usuario);
    }

    const [result] = await db.query(sql, parametros);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Calificación no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Calificación eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};
