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
  btnTotal: By.xpath("//button[contains(.,'Total a pagar')]"),
  plusBtnAny: By.xpath("(//button[.//i[contains(@class,'fa-plus')]])[1]")
};

const parseCLP = (t) => Number((t || "").replace(/[^\d]/g, "") || 0);

describe("Actualización de total al cambiar cantidad", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").setChromeOptions(opts).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("El total (o subtotal) cambia al sumar una unidad", async function () {
    await driver.get(BASE_URL);

    await driver.wait(until.elementLocated(sel.linkProductos), 15000);
    await driver.findElement(sel.linkProductos).click();

    await driver.wait(until.elementLocated(sel.anyAddBtn), 15000);
    await driver.findElement(sel.anyAddBtn).click();

    await driver.wait(until.elementLocated(sel.linkCarrito), 15000);
    await driver.findElement(sel.linkCarrito).click();

    await driver.wait(until.elementLocated(sel.btnTotal), 15000);
    const beforeTxt = await driver.findElement(sel.btnTotal).getText();
    const beforeVal = parseCLP(beforeTxt);

    await driver.wait(until.elementLocated(sel.plusBtnAny), 15000);
    await driver.findElement(sel.plusBtnAny).click();

    await driver.wait(async () => {
      const nowTxt = await driver.findElement(sel.btnTotal).getText();
      return parseCLP(nowTxt) > beforeVal;
    }, 15000);

    const afterTxt = await driver.findElement(sel.btnTotal).getText();
    const afterVal = parseCLP(afterTxt);

    if (!(afterVal > beforeVal)) {
      throw new Error(`Esperaba after(${afterVal}) > before(${beforeVal})`);
    }
  });
});
