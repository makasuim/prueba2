const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Búsqueda de producto", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Filtra productos al buscar un nombre existente", async () => {
    await driver.get(`${BASE_URL}/inventario`);
    await h.waitGone(h.By.id("loading")).catch(() => {});
    await h.waitVisible(h.By.css("input[type='search']"));

    const buscador = await driver.findElement(h.By.css("input[type='search']"));
    await buscador.sendKeys("gorra");

    const card = h.By.xpath("//div[contains(@class,'product-card')]");
    await h.waitVisible(card);

    const resultados = await driver.findElements(card);
    if (resultados.length === 0) throw new Error("No se filtraron resultados al buscar 'gorra'");
  });
});
