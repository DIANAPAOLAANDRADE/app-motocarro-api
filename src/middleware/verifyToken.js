const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Comprobar que la clave JWT esté configurada
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      mensaje: "La clave JWT no está configurada en el servidor"
    });
  }

  // Leer la cabecera Authorization
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Acceso denegado. Debes proporcionar un token JWT."
    });
  }

  // Extraer el token
  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      mensaje: "El token JWT está vacío."
    });
  }

  try {
    // Verificar la firma y la expiración del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar los datos del usuario autenticado
    req.usuario = decoded;

    // Continuar con la ruta solicitada
    return next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o vencido. Inicia sesión nuevamente."
    });
  }
}

module.exports = verifyToken;
