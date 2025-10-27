// tests/e2e/actualizarTotal.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function clickSmart(driver, el) {
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.wait(until.elementIsVisible(el), 15000);
  await driver.wait(until.elementIsEnabled(el), 15000);
  try { await driver.actions({ bridge: true }).move({ origin: el }).click().perform(); return; } catch {}
  try { await el.click(); return; } catch {}
  await driver.executeScript("window.scrollBy(0, -120);");
  await driver.sleep(200);
  try { await el.click(); return; } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

async function addFromDetail(driver) {
  await driver.get(`${BASE_URL}/inventario`);
  const firstCard = By.xpath("(//div[contains(@class,'product-card')])[1]");
  await driver.wait(until.elementLocated(firstCard), 20000);
  const link = By.xpath("(//div[contains(@class,'product-card')])[1]//a[1]");
  await driver.wait(until.elementLocated(link), 20000);
  const a = await driver.findElement(link);
  await clickSmart(driver, a);

  const plus = By.xpath("//button[.//i[contains(@class,'fa-plus')]]");
  await driver.wait(until.elementLocated(plus), 20000);
  const plusEl = await driver.findElement(plus);
  await clickSmart(driver, plusEl);

  const addBtn = By.xpath("//button[contains(.,'Añadir') or contains(.,'Agregar')]");
  await driver.wait(until.elementLocated(addBtn), 20000);
  const addEl = await driver.findElement(addBtn);
  await clickSmart(driver, addEl);
}

describe("Actualización de total al cambiar cantidad", function () {
  this.timeout(120000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new","--no-sandbox","--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => { if (driver) await driver.quit(); });

  it("El total cambia al modificar cantidad", async function () {
    await driver.get(`${BASE_URL}/`);
    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");

    await addFromDetail(driver);
    await driver.get(`${BASE_URL}/pago`);
    const totalBtn = By.xpath("//button[contains(.,'Total a pagar')]");
    await driver.wait(until.elementLocated(totalBtn), 20000);
    const readTotal = async () => {
      const txt = await driver.findElement(totalBtn).getText();
      const n = parseInt(txt.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(n) ? 0 : n;
    };
    const total1 = await readTotal();

    const firstItemPlus = By.xpath("(//div[contains(@class,'carrito-item') or contains(@class,'card')][.//i[contains(@class,'fa-times')] or .//i[contains(@class,'fa-plus')]])[1]//button[.//i[contains(@class,'fa-plus')]]");
    await driver.wait(until.elementLocated(firstItemPlus), 20000);
    const plusEl = await driver.findElement(firstItemPlus);
    await clickSmart(driver, plusEl);

    await driver.wait(async () => {
      const t2 = await readTotal();
      return t2 > total1;
    }, 30000);
  });
});
