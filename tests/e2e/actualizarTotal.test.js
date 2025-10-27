// tests/e2e/actualizarTotal.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function retry(fn, times = 3, delay = 400) {
  let lastErr;
  for (let i = 0; i < times; i++) {
    try { return await fn(); } catch (e) { lastErr = e; await new Promise(r=>setTimeout(r, delay)); }
  }
  throw lastErr;
}

async function clickSmart(driver, locator) {
  const el = await driver.findElement(locator);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.wait(until.elementIsVisible(el), 15000);
  try { await el.click(); return; } catch {}
  try { await driver.actions({ bridge: true }).move({ origin: el }).click().perform(); return; } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

async function addFromDetail(driver) {
  await driver.get(`${BASE_URL}/inventario`);
  const firstCardLink = By.xpath("(//div[contains(@class,'product-card')])[1]//a[1]");
  await driver.wait(until.elementLocated(firstCardLink), 25000);
  await clickSmart(driver, firstCardLink);

  const addBtn = By.xpath("//button[contains(.,'Añadir') or contains(.,'Agregar')]");
  await driver.wait(until.elementLocated(addBtn), 25000);
  await retry(async () => clickSmart(driver, addBtn), 4, 350);
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
    await driver.wait(until.elementLocated(totalBtn), 25000);

    const readTotal = async () => {
      const el = await driver.findElement(totalBtn);
      const txt = await el.getText();
      const n = parseInt(txt.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(n) ? 0 : n;
    };

    const total1 = await readTotal();

    await addFromDetail(driver);

    await driver.get(`${BASE_URL}/pago`);
    await driver.wait(until.elementLocated(totalBtn), 25000);
    await driver.wait(async () => {
      const t2 = await readTotal();
      return t2 > total1;
    }, 30000);
  });
});
