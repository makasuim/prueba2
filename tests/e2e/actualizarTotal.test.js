process.env.WEBDRIVER_MANAGER_VERSION = "true";
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

const opts = new chrome.Options().addArguments(
  "--headless=new",
  "--no-sandbox",
  "--disable-dev-shm-usage"
);

const sel = {
  linkProductos: By.xpath("//a[contains(.,'Productos')]"),
  anyAddBtn: By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]"),
  linkCarrito: By.xpath("//a[contains(.,'Mi carrito') or contains(.,'carrito')]"),
  deleteBtns: By.xpath("//button[.//i[contains(@class,'fa-times')]]")
};

describe("Eliminar producto del carrito", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").setChromeOptions(opts).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Elimina correctamente un producto del carrito", async function () {
    await driver.get(BASE_URL);

    await driver.wait(until.elementLocated(sel.linkProductos), 15000);
    await driver.findElement(sel.linkProductos).click();

    await driver.wait(until.elementLocated(sel.anyAddBtn), 15000);
    await driver.findElement(sel.anyAddBtn).click();

    await driver.wait(until.elementLocated(sel.linkCarrito), 15000);
    await driver.findElement(sel.linkCarrito).click();

    await driver.wait(until.elementLocated(sel.deleteBtns), 15000);
    let before = (await driver.findElements(sel.deleteBtns)).length;
    if (!before) throw new Error("No hay items en el carrito");

    await driver.findElement(sel.deleteBtns).click();

    await driver.wait(async () => {
      const count = (await driver.findElements(sel.deleteBtns)).length;
      return count < before;
    }, 15000);

    const after = (await driver.findElements(sel.deleteBtns)).length;
    if (!(after < before)) {
      throw new Error(`Esperaba after(${after}) < before(${before})`);
    }
  });
});
