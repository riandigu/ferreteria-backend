const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Configura tu Access Token de Mercado Pago desde variable de entorno
mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

// Ruta para crear la preferencia
app.post("/crear_preferencia", async (req, res) => {
  try {
    const items = req.body.items.map(item => ({
      title: item.name,
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
    res.status(500).json({ error: "Error creando preferencia" });
  }
});

// Rutas de prueba para redirección
app.get("/success", (req, res) => {
  res.send("Pago aprobado ✅");
});

app.get("/failure", (req, res) => {
  res.send("Pago fallido ❌");
});

app.get("/pending", (req, res) => {
  res.send("Pago pendiente ⏳");
});

// Render asigna puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto", PORT));
