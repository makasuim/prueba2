const { buildMobileDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Flujo móvil: Offcanvas → IR A PAGAR", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildMobileDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Abre el offcanvas y va a /pago con IR A PAGAR", async () => {
    await driver.get(BASE_URL);

    // Abre menú hamburguesa
    await h.clickSafe(h.By.css(".menu-hamburguesa"));

    // Botón IR A PAGAR
    await h.clickSafe(h.By.xpath("//button[contains(.,'IR A PAGAR')]"));

    // Llega a /pago
    await h.waitUrlContains("/pago");

    // Valida presencia de UI de pago
    await h.waitVisible(h.By.xpath("//*[contains(.,'Total') or contains(.,'Pagar') or contains(.,'Resumen')]"));
  });
});
