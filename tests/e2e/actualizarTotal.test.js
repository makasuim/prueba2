const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Actualización de total al cambiar cantidad", function () {
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

  it("El total (o subtotal) cambia al sumar una unidad", async function () {
    await driver.get(`${BASE_URL}/inventario`);
    const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.wait(until.elementLocated(addBtn), 15000);
    const el = await driver.findElement(addBtn);
    await driver.executeScript("arguments[0].scrollIntoView(true);", el);
    await driver.wait(until.elementIsVisible(el), 5000);
    await driver.sleep(500);
    await el.click();

    await driver.get(`${BASE_URL}/pago`);
    const totalBtn = By.xpath("//button[contains(.,'Total a pagar')]");
    await driver.wait(until.elementLocated(totalBtn), 15000);
    const readTotal = async () => {
      const txt = await driver.findElement(totalBtn).getText();
      const n = parseInt(txt.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(n) ? 0 : n;
    };
    const before = await readTotal();

    const plusBtn = By.xpath("(//button[.//i[contains(@class,'fa-plus')]])[1]");
    const plusEl = await driver.findElement(plusBtn);
    await driver.executeScript("arguments[0].scrollIntoView(true);", plusEl);
    await driver.wait(until.elementIsVisible(plusEl), 5000);
    await driver.sleep(500);
    await plusEl.click();

    await driver.wait(async () => {
      const now = await readTotal();
      return now > before;
    }, 15000);
  });
});
