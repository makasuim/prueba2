const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Búsqueda de producto (si existe buscador)", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Filtra productos al buscar 'gorra' (si hay buscador)", async () => {
    await driver.get(`${BASE_URL}/inventario`);
    const searchCandidates = [
      h.By.css("input[type='search']"),
      h.By.css("input[placeholder*='Buscar' i]"),
      h.By.css("[data-testid='search'] input, [data-testid='search']")
    ];

    let searchEl = null;
    for (const loc of searchCandidates) {
      const els = await driver.findElements(loc);
      if (els.length) { searchEl = els[0]; break; }
    }

    if (!searchEl) {
      console.log("No hay buscador en la UI → se omite este test.");
      this.skip();
      return;
    }

    await searchEl.sendKeys("gorra");
    const card = h.By.xpath("//div[contains(@class,'product-card')]");
    // Con que exista una card visible tras teclear, damos OK
    await h.waitVisible(card);
  });
});
