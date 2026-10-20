const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API Servicio de Motocarro",
      version: "1.0.0",
      description:
        "Servicios REST para gestionar usuarios, conductores, vehículos, servicios de transporte, pagos y calificaciones."
    },

    servers: [
      {
        url: "http://localhost:3000"
      }
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Pega aquí el token JWT obtenido al iniciar sesión. No escribas la palabra Bearer."
        }
      }
    }
  },

  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);