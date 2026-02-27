const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   CONFIG MERCADOPAGO
================================ */

mercadopago.configurations.setAccessToken(
  process.env.MP_ACCESS_TOKEN
);

/* ================================
   CREAR PREFERENCIA
================================ */

app.post("/crear_preferencia", async (req, res) => {

  try {

    const cliente = req.body.cliente;
    const itemsFront = req.body.items;

    const items = itemsFront.map(item => ({
      title: item.name,
      quantity: 1,
      currency_id: "CLP",
      unit_price: Number(item.price)
    }));

    const preference = {

      items,

      metadata: {
        cliente,
        items: itemsFront
      },

      auto_return: "approved",

      notification_url:
        "https://ferreteria-backend-1-8dmm.onrender.com/webhook",

      back_urls: {
        success:
          "https://riandigu.github.io/ferreteria-online",
        failure:
          "https://riandigu.github.io/ferreteria-online",
        pending:
          "https://riandigu.github.io/ferreteria-online"
      }
    };

    const response =
      await mercadopago.preferences.create(preference);

    res.json({
      init_point: response.body.init_point
    });

  } catch (error) {

    console.error("Error creando preferencia:", error);
    res.status(500).json({
      error: "Error creando preferencia"
    });
  }
});

/* ================================
   WEBHOOK MERCADOPAGO
================================ */

app.post("/webhook", async (req, res) => {

  try {

    if (req.body.type === "payment") {

      const paymentId = req.body.data.id;

      const payment =
        await mercadopago.payment.findById(paymentId);

      const data = payment.body;

      if (data.status === "approved") {

        const cliente =
          data.metadata.cliente;

        const items =
          data.metadata.items;

        /* ===== PEDIDO GENERAL ===== */

        const linea =
`${cliente.nombre},
${cliente.telefono},
${cliente.direccion},
${cliente.departamento},
TOTAL:${data.transaction_amount}
\n`;

        fs.appendFileSync("pedidos.csv", linea);

        /* ===== TICKET POR DEPTO ===== */

        const departamentos = {};

        items.forEach(item => {

          if (!departamentos[item.dep])
            departamentos[item.dep] = [];

          departamentos[item.dep].push(item);
        });

        Object.keys(departamentos)
          .forEach(dep => {

            let ticket =
`===== PEDIDO =====
Departamento: ${dep}
Cliente: ${cliente.nombre}
Tel: ${cliente.telefono}
Dirección: ${cliente.direccion}

Productos:
`;

            departamentos[dep]
              .forEach(p => {
                ticket +=
`${p.name} - $${p.price}\n`;
              });

            ticket +=
`\nTOTAL: ${data.transaction_amount}
====================\n\n`;

            fs.appendFileSync(
              `ticket_${dep}.txt`,
              ticket
            );
          });

        console.log("✅ Pedido guardado");
      }
    }

    res.sendStatus(200);

  } catch (err) {

    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

/* ================================
   REDIRECCIONES
================================ */

app.get("/success", (req, res) => {
  res.redirect(
    "https://riandigu.github.io/ferreteria-online"
  );
});

app.get("/failure", (req, res) => {
  res.redirect(
    "https://riandigu.github.io/ferreteria-online"
  );
});

app.get("/pending", (req, res) => {
  res.redirect(
    "https://riandigu.github.io/ferreteria-online"
  );
});

/* ================================
   SERVER
================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log("Servidor corriendo en puerto", PORT)
);
