const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Eliminar producto del carrito", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    try { await driver.manage().window().setRect({ width: 1366, height: 900 }); } catch {}
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Elimina correctamente un producto del carrito", async function () {
    await driver.get(`${BASE_URL}/inventario`);

    const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.wait(until.elementLocated(addBtn), 15000);
    await driver.findElement(addBtn).click();

    await driver.get(`${BASE_URL}/pago`);

    const deleteBtn = By.xpath("(//button[.//i[contains(@class,'fa-times')]])[1]");
    await driver.wait(until.elementLocated(deleteBtn), 15000);

    const before = await driver.findElements(deleteBtn);
    if (!before.length) throw new Error("No hay items en el carrito");

    await driver.findElement(deleteBtn).click();

    await driver.sleep(800);

    const after = await driver.findElements(deleteBtn);
    const emptyAlert = await driver.findElements(By.xpath("//*[contains(.,'No hay productos en el carrito')]"));

    if (before.length === 1) {
      if (!(emptyAlert.length > 0 || after.length === 0)) throw new Error("El carrito no quedó vacío tras eliminar el único item");
    } else {
      if (after.length !== before.length - 1) throw new Error("No se eliminó el producto del carrito");
    }
  });
});
