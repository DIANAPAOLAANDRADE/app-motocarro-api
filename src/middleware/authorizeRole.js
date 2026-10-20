function authorizeRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión para acceder a este recurso"
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: "No tienes permisos para realizar esta operación"
      });
    }

    return next();
  };
}

module.exports = authorizeRole;