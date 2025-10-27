const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Descuento aplicado en producto", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Muestra precio rebajado cuando existe descuento", async () => {
    await driver.get(`${BASE_URL}/inventario`);
    await h.waitGone(h.By.id("loading")).catch(() => {});
    const card = h.By.xpath("(//div[contains(@class,'product-card')])[1]");
    await h.waitVisible(card);

    const tieneDescuento = await driver.findElements(
      h.By.xpath("(//div[contains(@class,'product-card')])[1]//*[contains(.,'% OFF')]")
    );

    if (tieneDescuento.length > 0) {
      const precioTachado = await driver.findElements(
        h.By.xpath("(//div[contains(@class,'product-card')])[1]//s")
      );
      if (precioTachado.length === 0)
        throw new Error("El descuento no muestra el precio anterior tachado");
    }
  });
});
