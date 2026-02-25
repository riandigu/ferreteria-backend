const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Configura el access token desde variable de entorno
mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

app.post("/crear_preferencia", async (req, res) => {
  try {
    const items = req.body.items.map(item => ({
      title: item.nombre,
      quantity: 1,
      currency_id: "CLP",
      unit_price: Number(item.precio)
    }));

const preference = {
  items,
  auto_return: "approved",
  back_urls: {
    success: "https://riandigu.github.io/ferreteria-frontend/success.html",
    failure: "https://riandigu.github.io/ferreteria-frontend/success.html",
    pending: "https://riandigu.github.io/ferreteria-frontend/success.html"
  }
};

    const response = await mercadopago.preferences.create(preference);

    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Servidor corriendo en puerto", PORT));
