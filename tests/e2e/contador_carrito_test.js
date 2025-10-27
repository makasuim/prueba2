const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Badge del carrito en header", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Aumenta al añadir un producto desde inventario", async () => {
    await driver.get(BASE_URL);
    await h.waitGone(h.By.id("loading")).catch(() => {});

    // Ir a Productos
    await h.clickSafe(h.By.xpath("//nav//a[contains(.,'Productos')]"));
    await h.waitUrlContains("/inventario");

    // Lee contador actual
    const badge = await h.waitVisible(h.By.id("cart-count-desktop"));
    const before = parseInt(await badge.getText(), 10) || 0;

    // Click en "Añadir" de la primera card
    const addBtnInFirstCard = h.By.xpath(
      "(//div[contains(@class,'product-card')])[1]//button[contains(.,'Añadir') or contains(.,'Agregar')]"
    );
    await h.clickSafe(addBtnInFirstCard);

    // Vuelve a leer
    const badge2 = await h.waitVisible(h.By.id("cart-count-desktop"));
    const after = parseInt(await badge2.getText(), 10) || 0;

    if (!(after > before)) throw new Error(`Esperaba after(${after}) > before(${before})`);
  });
});
