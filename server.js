require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./src/config/swagger");
const db = require("./src/config/db");

const usuariosRoutes = require("./src/routes/usuarios.routes");
const conductoresRoutes = require("./src/routes/conductores.routes");
const vehiculosRoutes = require("./src/routes/vehiculos.routes");
const serviciosRoutes = require("./src/routes/servicios.routes");
const pagosRoutes = require("./src/routes/pagos.routes");
const calificacionesRoutes = require("./src/routes/calificaciones.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    proyecto: "API Servicio de Motocarro",
    version: "1.0.0",
    estado: "activo",
    documentacion: "/api-docs"
  });
});

// Prueba de conexión con MySQL
app.get("/api/health", async (req, res, next) => {
  try {
    await db.query("SELECT 1");

    res.json({
      api: "activa",
      base_datos: "conectada",
      base: process.env.DB_NAME || "motocarros_buesaco"
    });
  } catch (error) {
    next(error);
  }
});

// Servicios REST
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/conductores", conductoresRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/calificaciones", calificacionesRoutes);

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    mensaje: "Error interno del servidor",
    detalle: err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ejecutándose en http://localhost:${PORT}`);
  console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});
