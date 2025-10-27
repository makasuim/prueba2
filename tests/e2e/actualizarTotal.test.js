const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Actualización de total al cambiar cantidad", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("El total cambia al sumar una unidad más", async () => {
    await driver.get(`${BASE_URL}/inventario`);
    await h.clickSafe(h.By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]"));
    await h.clickSafe(h.By.xpath("//a[contains(.,'carrito')]"));
    await h.waitUrlContains("/pago");

    const totalElement = await h.waitVisible(h.By.xpath("//*[contains(.,'Total')]/following::strong[1]"));
    const totalAntes = parseFloat((await totalElement.getText()).replace(/[^\d]/g, "")) || 0;

    const botonSumar = h.By.xpath("//button[contains(.,'+')]");
    await h.clickSafe(botonSumar);

    await new Promise(r => setTimeout(r, 1000));

    const totalDespues = parseFloat((await totalElement.getText()).replace(/[^\d]/g, "")) || 0;

    if (totalDespues <= totalAntes)
      throw new Error(`El total no cambió tras aumentar cantidad (${totalAntes} → ${totalDespues})`);
  });
});
