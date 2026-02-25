const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de Mercado Pago
// Asegúrate de crear en Render la variable de entorno: MP_ACCESS_TOKEN=TEST-2754761979785782-022420-fc4ff1c5e7e23432ff5bc4e9cfe1412d-5849844
mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

// Endpoint para crear la preferencia
app.post("/crear_preferencia", async (req, res) => {
  try {
    const items = req.body.items.map(item => ({
      title: item.name,       // desde tu frontend
      quantity: 1,
      currency_id: "CLP",
      unit_price: Number(item.price)
    }));

    const preference = {
      items,
      auto_return: "approved",
      back_urls: {
        success: "https://ferreteria-backend-1-8dmm.onrender.com/success",
        failure: "https://ferreteria-backend-1-8dmm.onrender.com/failure",
        pending: "https://ferreteria-backend-1-8dmm.onrender.com/pending"
      }
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });

  } catch (error) {
    console.error("Error creando preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

// Rutas de retorno de Mercado Pago
app.get("/success", (req, res) => {
  res.send("<h1>Pago aprobado ✅</h1><p>Gracias por tu compra.</p>");
});

app.get("/failure", (req, res) => {
  res.send("<h1>Pago fallido ❌</h1><p>Intenta nuevamente.</p>");
});

app.get("/pending", (req, res) => {
  res.send("<h1>Pago pendiente ⏳</h1><p>Estamos esperando la confirmación.</p>");
});

// Puerto dinámico de Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});