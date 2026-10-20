function authorizeOwnerOrAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      mensaje: "Debes iniciar sesión"
    });
  }

  const idSolicitado = Number(req.params.id);
  const idAutenticado = Number(req.usuario.id_usuario);

  if (
    req.usuario.rol === "admin" ||
    (
      Number.isInteger(idSolicitado) &&
      idAutenticado === idSolicitado
    )
  ) {
    return next();
  }

  return res.status(403).json({
    mensaje: "Solo puedes acceder a tu propia cuenta"
  });
}

module.exports = authorizeOwnerOrAdmin;