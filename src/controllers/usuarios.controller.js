const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LISTAR USUARIOS SIN EXPONER CONTRASEÑAS
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id_usuario,
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        fecha_registro,
        rol
      FROM usuarios
      ORDER BY id_usuario DESC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// OBTENER USUARIO POR ID
exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
        id_usuario,
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        fecha_registro,
        rol
       FROM usuarios
       WHERE id_usuario = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// CREAR USUARIO
// Las cuentas nuevas siempre empiezan con rol cliente.
exports.crear = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      documento,
      telefono,
      correo,
      contrasena
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !documento ||
      !telefono ||
      !correo ||
      !contrasena
    ) {
      return res.status(400).json({
        mensaje: "Faltan campos obligatorios"
      });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios
        (
          nombre,
          apellido,
          documento,
          telefono,
          correo,
          contrasena,
          rol
        )
       VALUES (?, ?, ?, ?, ?, ?, 'cliente')`,
      [
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        contrasenaHash
      ]
    );

    return res.status(201).json({
      id_usuario: result.insertId,
      rol: "cliente",
      mensaje: "Usuario creado correctamente"
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "El documento o correo ya está registrado"
      });
    }

    next(error);
  }
};

// INICIAR SESIÓN Y GENERAR TOKEN JWT
exports.login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        mensaje: "El correo y la contraseña son obligatorios"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        mensaje: "La clave JWT no está configurada en el servidor"
      });
    }

    const [rows] = await db.query(
      `SELECT
        id_usuario,
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        contrasena,
        fecha_registro,
        rol
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const usuario = rows[0];
    const contrasenaGuardada = String(usuario.contrasena);
    const contrasenaIngresada = String(contrasena);

    // Detectar si la contraseña ya está almacenada con bcrypt.
    const tieneHashBcrypt =
      /^\$2[aby]\$\d{2}\$/.test(contrasenaGuardada);

    let contrasenaValida = false;

    if (tieneHashBcrypt) {
      contrasenaValida = await bcrypt.compare(
        contrasenaIngresada,
        contrasenaGuardada
      );
    } else {
      // Compatibilidad temporal con cuentas antiguas.
      contrasenaValida =
        contrasenaIngresada === contrasenaGuardada;
    }

    if (!contrasenaValida) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    // Convertir a hash las contraseñas antiguas tras validarlas.
    if (!tieneHashBcrypt) {
      const nuevoHash = await bcrypt.hash(
        contrasenaIngresada,
        10
      );

      await db.query(
        `UPDATE usuarios
         SET contrasena = ?
         WHERE id_usuario = ?`,
        [nuevoHash, usuario.id_usuario]
      );
    }

    // Incluir el rol dentro del token firmado.
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    // No devolver la contraseña ni su hash.
    const datosUsuario = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      documento: usuario.documento,
      telefono: usuario.telefono,
      correo: usuario.correo,
      fecha_registro: usuario.fecha_registro,
      rol: usuario.rol
    };

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: datosUsuario
    });
  } catch (error) {
    next(error);
  }
};

// ACTUALIZAR USUARIO
exports.actualizar = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      documento,
      telefono,
      correo,
      contrasena
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !documento ||
      !telefono ||
      !correo
    ) {
      return res.status(400).json({
        mensaje:
          "Nombre, apellido, documento, teléfono y correo son obligatorios"
      });
    }

    const id = req.params.id;

    const [usuarios] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    if (contrasena && contrasena.trim() !== "") {
      const contrasenaHash = await bcrypt.hash(contrasena, 10);

      await db.query(
        `UPDATE usuarios
         SET nombre = ?,
             apellido = ?,
             documento = ?,
             telefono = ?,
             correo = ?,
             contrasena = ?
         WHERE id_usuario = ?`,
        [
          nombre,
          apellido,
          documento,
          telefono,
          correo,
          contrasenaHash,
          id
        ]
      );
    } else {
      await db.query(
        `UPDATE usuarios
         SET nombre = ?,
             apellido = ?,
             documento = ?,
             telefono = ?,
             correo = ?
         WHERE id_usuario = ?`,
        [
          nombre,
          apellido,
          documento,
          telefono,
          correo,
          id
        ]
      );
    }

    return res.status(200).json({
      mensaje: "Usuario actualizado correctamente"
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "El documento o correo ya está registrado"
      });
    }

    next(error);
  }
};

// ELIMINAR USUARIO
exports.eliminar = async (req, res, next) => {
  try {
    const [result] = await db.query(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Usuario eliminado correctamente"
    });
  } catch (error) {
    next(error);
  }
};