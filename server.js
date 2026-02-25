const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Usamos variable de entorno (MUY IMPORTANTE)
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
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({ preferenceId: response.body.id });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

// Render usa este puerto dinámico
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});