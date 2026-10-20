const db = require("../config/db");

const ESTADOS_PERMITIDOS = [
  "solicitado",
  "aceptado",
  "en_camino",
  "finalizado",
  "cancelado"
];

// Obtener el conductor asociado a un usuario.
async function obtenerIdConductor(idUsuario) {
  const [rows] = await db.query(
    "SELECT id_conductor FROM conductores WHERE id_usuario = ?",
    [idUsuario]
  );

  return rows.length ? rows[0].id_conductor : null;
}

// Validar que el usuario tenga un rol reconocido.
function rolPermitido(req, res) {
  const roles = ["admin", "conductor", "cliente"];

  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    res.status(403).json({
      mensaje: "Rol no autorizado para esta operación"
    });
    return false;
  }

  return true;
}

// LISTAR SERVICIOS SEGÚN EL ROL
exports.listar = async (req, res, next) => {
  try {
    if (!rolPermitido(req, res)) return;

    let filtro = "";
    let parametros = [];

    if (req.usuario.rol === "cliente") {
      filtro = "WHERE s.id_usuario = ?";
      parametros = [req.usuario.id_usuario];
    }

    if (req.usuario.rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(200).json([]);
      }

      filtro = "WHERE s.id_conductor = ?";
      parametros = [idConductor];
    }

    const [rows] = await db.query(
      `
      SELECT
        s.id_servicio,
        s.id_usuario,
        u.nombre AS cliente,
        s.id_conductor,
        cu.nombre AS conductor,
        s.id_motocarro,
        s.origen,
        s.destino,
        s.fecha_servicio,
        s.valor,
        s.estado
      FROM servicios s
      INNER JOIN usuarios u
        ON u.id_usuario = s.id_usuario
      LEFT JOIN conductores c
        ON c.id_conductor = s.id_conductor
      LEFT JOIN usuarios cu
        ON cu.id_usuario = c.id_usuario
      ${filtro}
      ORDER BY s.id_servicio DESC
      `,
      parametros
    );

    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// OBTENER SERVICIO POR ID CON CONTROL DE ACCESO
exports.obtener = async (req, res, next) => {
  try {
    if (!rolPermitido(req, res)) return;

    let filtro = "";
    let parametros = [req.params.id];

    if (req.usuario.rol === "cliente") {
      filtro = "AND s.id_usuario = ?";
      parametros.push(req.usuario.id_usuario);
    }

    if (req.usuario.rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(404).json({
          mensaje: "Servicio no encontrado"
        });
      }

      filtro = "AND s.id_conductor = ?";
      parametros.push(idConductor);
    }

    const [rows] = await db.query(
      `
      SELECT
        s.id_servicio,
        s.id_usuario,
        u.nombre AS cliente,
        s.id_conductor,
        cu.nombre AS conductor,
        s.id_motocarro,
        s.origen,
        s.destino,
        s.fecha_servicio,
        s.valor,
        s.estado
      FROM servicios s
      INNER JOIN usuarios u
        ON u.id_usuario = s.id_usuario
      LEFT JOIN conductores c
        ON c.id_conductor = s.id_conductor
      LEFT JOIN usuarios cu
        ON cu.id_usuario = c.id_usuario
      WHERE s.id_servicio = ?
      ${filtro}
      `,
      parametros
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// CREAR SERVICIO
exports.crear = async (req, res, next) => {
  try {
    if (!rolPermitido(req, res)) return;

    const {
      id_usuario,
      id_conductor,
      id_motocarro,
      origen,
      destino,
      valor,
      estado
    } = req.body;

    const rol = req.usuario.rol;

    if (rol === "conductor") {
      return res.status(403).json({
        mensaje: "Los conductores no pueden crear solicitudes de servicio"
      });
    }

    if (!origen || !destino) {
      return res.status(400).json({
        mensaje: "Origen y destino son obligatorios"
      });
    }

    // Los clientes solo pueden solicitar servicios para sí mismos.
    const idUsuarioFinal =
      rol === "cliente" ? req.usuario.id_usuario : id_usuario;

    if (!idUsuarioFinal) {
      return res.status(400).json({
        mensaje: "El usuario del servicio es obligatorio"
      });
    }

    // Los clientes no pueden asignar por su cuenta
    // conductores, vehículos ni estados de servicio.
    const idConductorFinal =
      rol === "admin" ? (id_conductor || null) : null;

    const idMotocarroFinal =
      rol === "admin" ? (id_motocarro || null) : null;

    const valorFinal =
      rol === "admin" ? Number(valor ?? 0) : 0;

    if (!Number.isFinite(valorFinal) || valorFinal < 0) {
      return res.status(400).json({
        mensaje: "El valor debe ser un número igual o mayor que cero"
      });
    }

    const estadoFinal =
      rol === "admin" && estado
        ? String(estado).trim().toLowerCase()
        : "solicitado";

    if (!ESTADOS_PERMITIDOS.includes(estadoFinal)) {
      return res.status(400).json({
        mensaje: "Estado no válido",
        estados_permitidos: ESTADOS_PERMITIDOS
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO servicios (
        id_usuario,
        id_conductor,
        id_motocarro,
        origen,
        destino,
        valor,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        idUsuarioFinal,
        idConductorFinal,
        idMotocarroFinal,
        origen,
        destino,
        valorFinal,
        estadoFinal
      ]
    );

    return res.status(201).json({
      id_servicio: result.insertId,
      mensaje: "Servicio creado",
      estado: estadoFinal
    });
  } catch (error) {
    next(error);
  }
};

// ACTUALIZAR SERVICIO SEGÚN EL ROL
exports.actualizar = async (req, res, next) => {
  try {
    if (!rolPermitido(req, res)) return;

    const id = req.params.id;
    const { id_conductor, id_motocarro, valor, estado } = req.body;
    const rol = req.usuario.rol;

    const estadoFinal = estado
      ? String(estado).trim().toLowerCase()
      : "";

    if (!ESTADOS_PERMITIDOS.includes(estadoFinal)) {
      return res.status(400).json({
        mensaje: "Estado no válido",
        estados_permitidos: ESTADOS_PERMITIDOS
      });
    }

    // ADMIN: puede actualizar el servicio completo.
    if (rol === "admin") {
      const valorFinal = Number(valor ?? 0);

      if (!Number.isFinite(valorFinal) || valorFinal < 0) {
        return res.status(400).json({
          mensaje: "El valor debe ser un número igual o mayor que cero"
        });
      }

      const [result] = await db.query(
        `
        UPDATE servicios
        SET id_conductor = ?,
            id_motocarro = ?,
            valor = ?,
            estado = ?
        WHERE id_servicio = ?
        `,
        [
          id_conductor || null,
          id_motocarro || null,
          valorFinal,
          estadoFinal,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "Servicio no encontrado"
        });
      }

      return res.status(200).json({
        mensaje: "Servicio actualizado"
      });
    }

    // CONDUCTOR: solo puede cambiar el estado de un servicio
    // que tenga asignado.
    if (rol === "conductor") {
      const idConductor = await obtenerIdConductor(
        req.usuario.id_usuario
      );

      if (idConductor === null) {
        return res.status(403).json({
          mensaje: "El usuario no tiene un registro de conductor"
        });
      }

      const estadosConductor = [
        "aceptado",
        "en_camino",
        "finalizado",
        "cancelado"
      ];

      if (!estadosConductor.includes(estadoFinal)) {
        return res.status(400).json({
          mensaje: "El estado solicitado no está permitido para conductores"
        });
      }

      const [result] = await db.query(
        `
        UPDATE servicios
        SET estado = ?
        WHERE id_servicio = ?
          AND id_conductor = ?
        `,
        [estadoFinal, id, idConductor]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "Servicio no encontrado o no asignado a este conductor"
        });
      }

      return res.status(200).json({
        mensaje: "Estado del servicio actualizado"
      });
    }

    // CLIENTE: solo puede cancelar su propia solicitud pendiente.
    if (rol === "cliente") {
      if (estadoFinal !== "cancelado") {
        return res.status(403).json({
          mensaje: "El cliente solo puede cancelar una solicitud pendiente"
        });
      }

      const [result] = await db.query(
        `
        UPDATE servicios
        SET estado = 'cancelado'
        WHERE id_servicio = ?
          AND id_usuario = ?
          AND estado = 'solicitado'
        `,
        [id, req.usuario.id_usuario]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "No se encontró una solicitud pendiente propia para cancelar"
        });
      }

      return res.status(200).json({
        mensaje: "Solicitud cancelada"
      });
    }
  } catch (error) {
    next(error);
  }
};

// ELIMINAR SERVICIO: SOLO ADMINISTRADOR
exports.eliminar = async (req, res, next) => {
  try {
    if (!rolPermitido(req, res)) return;

    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        mensaje: "Solo un administrador puede eliminar servicios"
      });
    }

    const [result] = await db.query(
      "DELETE FROM servicios WHERE id_servicio = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Servicio eliminado"
    });
  } catch (error) {
    next(error);
  }
};