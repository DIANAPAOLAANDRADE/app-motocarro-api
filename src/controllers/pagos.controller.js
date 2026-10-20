const db = require("../config/db");

// Obtener el ID del conductor asociado al usuario autenticado.
async function obtenerIdConductor(idUsuario) {
  const [rows] = await db.query(
    "SELECT id_conductor FROM conductores WHERE id_usuario = ?",
    [idUsuario]
  );

  return rows.length ? rows[0].id_conductor : null;
}

// LISTAR PAGOS SEGÚN EL ROL
exports.listar = async (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión"
      });
    }

    let filtro = "";
    let parametros = [];

    if (req.usuario.rol === "cliente") {
      filtro = "WHERE s.id_usuario = ?";
      parametros = [req.usuario.id_usuario];
    } else if (req.usuario.rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(200).json([]);
      }

      filtro = "WHERE s.id_conductor = ?";
      parametros = [idConductor];
    } else if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        mensaje: "No tienes permisos para consultar pagos"
      });
    }

    const [rows] = await db.query(
      `SELECT p.*
       FROM pagos p
       INNER JOIN servicios s
         ON s.id_servicio = p.id_servicio
       ${filtro}
       ORDER BY p.id_pago DESC`,
      parametros
    );

    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// OBTENER UN PAGO POR ID SEGÚN EL ROL
exports.obtener = async (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión"
      });
    }

    let filtro = "";
    const parametros = [req.params.id];

    if (req.usuario.rol === "cliente") {
      filtro = "AND s.id_usuario = ?";
      parametros.push(req.usuario.id_usuario);
    } else if (req.usuario.rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(404).json({
          mensaje: "Pago no encontrado"
        });
      }

      filtro = "AND s.id_conductor = ?";
      parametros.push(idConductor);
    } else if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        mensaje: "No tienes permisos para consultar este pago"
      });
    }

    const [rows] = await db.query(
      `SELECT p.*
       FROM pagos p
       INNER JOIN servicios s
         ON s.id_servicio = p.id_servicio
       WHERE p.id_pago = ?
       ${filtro}`,
      parametros
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Pago no encontrado"
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// CREAR PAGO
exports.crear = async (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión"
      });
    }

    const { id_servicio, metodo_pago, valor, estado } = req.body;
    const rol = req.usuario.rol;

    if (rol !== "admin" && rol !== "cliente") {
      return res.status(403).json({
        mensaje: "Los conductores no pueden registrar pagos"
      });
    }

    if (!id_servicio || !metodo_pago) {
      return res.status(400).json({
        mensaje: "El servicio y el método de pago son obligatorios"
      });
    }

    // Comprobar que el servicio exista.
    const [servicios] = await db.query(
      `SELECT id_servicio, id_usuario, valor
       FROM servicios
       WHERE id_servicio = ?`,
      [id_servicio]
    );

    if (servicios.length === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    const servicio = servicios[0];

    // Un cliente solo puede registrar pagos de sus propios servicios.
    if (
      rol === "cliente" &&
      Number(servicio.id_usuario) !== Number(req.usuario.id_usuario)
    ) {
      return res.status(403).json({
        mensaje: "No puedes registrar pagos de servicios ajenos"
      });
    }

    // El cliente no puede decidir el valor ni marcarlo como pagado.
    const valorFinal =
      rol === "admin" && valor !== undefined
        ? Number(valor)
        : Number(servicio.valor);

    if (!Number.isFinite(valorFinal) || valorFinal < 0) {
      return res.status(400).json({
        mensaje: "El valor del pago no es válido"
      });
    }

    let estadoFinal = "Pendiente";

    if (rol === "admin" && estado !== undefined) {
      if (!["Pendiente", "Pagado"].includes(estado)) {
        return res.status(400).json({
          mensaje: "El estado debe ser Pendiente o Pagado"
        });
      }

      estadoFinal = estado;
    }

    const [resultado] = await db.query(
      `INSERT INTO pagos
         (id_servicio, metodo_pago, valor, estado)
       VALUES (?, ?, ?, ?)`,
      [
        id_servicio,
        metodo_pago,
        valorFinal,
        estadoFinal
      ]
    );

    return res.status(201).json({
      id_pago: resultado.insertId,
      mensaje: "Pago registrado",
      estado: estadoFinal
    });
  } catch (error) {
    next(error);
  }
};

// ACTUALIZAR ESTADO: SOLO ADMINISTRADOR
exports.actualizarEstado = async (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión"
      });
    }

    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        mensaje: "Solo un administrador puede cambiar el estado de un pago"
      });
    }

    const { estado } = req.body;

    if (!["Pendiente", "Pagado"].includes(estado)) {
      return res.status(400).json({
        mensaje: "El estado debe ser Pendiente o Pagado"
      });
    }

    // Comprobar existencia antes de actualizar.
    const [pagos] = await db.query(
      "SELECT id_pago FROM pagos WHERE id_pago = ?",
      [req.params.id]
    );

    if (pagos.length === 0) {
      return res.status(404).json({
        mensaje: "Pago no encontrado"
      });
    }

    await db.query(
      "UPDATE pagos SET estado = ? WHERE id_pago = ?",
      [estado, req.params.id]
    );

    return res.status(200).json({
      mensaje: "Estado del pago actualizado",
      estado
    });
  } catch (error) {
    next(error);
  }
};