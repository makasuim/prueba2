const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Filtro por categoría en inventario", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Muestra productos al entrar con ?categoria=juguetes", async () => {
    await driver.get(`${BASE_URL}/inventario?categoria=juguetes`);
    await h.waitGone(h.By.id("loading")).catch(() => {});
    await h.waitUrlContains("categoria=juguetes");
    await h.waitVisible(h.By.xpath("(//div[contains(@class,'product-card')])[1]"));
  });
});
