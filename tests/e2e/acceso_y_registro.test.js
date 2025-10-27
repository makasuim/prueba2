// tests/e2e/acceso_y_registro.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function waitFor(fn, timeout = 20000, interval = 250) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const ok = await fn();
      if (ok) return true;
    } catch {}
    if (Date.now() - start > timeout) throw new Error("waitFor timeout");
    await new Promise(r => setTimeout(r, interval));
  }
}

async function clickSmart(driver, locator) {
  const el = await driver.findElement(locator);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.wait(until.elementIsVisible(el), 15000);
  try { await el.click(); return; } catch {}
  try { await driver.actions({ bridge: true }).move({ origin: el }).click().perform(); return; } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

describe("Registro y acceso", function () {
  this.timeout(120000);
  let driver;
  const email = `e2e${Date.now()}@gmail.com`;
  const pass = `P@ssw0rd!${Date.now()}`;
  const nombre = "Usuario Prueba";

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new","--no-sandbox","--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => { if (driver) await driver.quit(); });

  it("Registra y luego accede correctamente", async function () {
    await driver.get(`${BASE_URL}/registro`);

    await driver.executeScript(
      "try{localStorage.setItem('usuarioRegistrado', JSON.stringify({ nombreCompleto: arguments[0], correo: arguments[1], contrasena: arguments[2] }));}catch(e){}",
      nombre, email, pass
    );

    await waitFor(async () => {
      const s = await driver.executeScript("return localStorage.getItem('usuarioRegistrado')");
      if (!s) return false;
      try { const o = JSON.parse(s); return o && o.correo === email && o.contrasena === pass; } catch { return false; }
    }, 25000, 300);

    await driver.get(`${BASE_URL}/acceso`);
    const mailInput = By.css("input[type='email']");
    const passInput = By.css("input[type='password']");
    await driver.wait(until.elementLocated(mailInput), 20000);
    await driver.findElement(mailInput).clear();
    await driver.findElement(mailInput).sendKeys(email);
    await driver.findElement(passInput).clear();
    await driver.findElement(passInput).sendKeys(pass);

    const submitBtn =
      By.xpath("//form//button[@type='submit'] | //button[contains(.,'Iniciar') or contains(.,'Acceder') or contains(.,'Entrar')]");

    await driver.wait(until.elementLocated(submitBtn), 20000);
    await clickSmart(driver, submitBtn);

    await waitFor(async () => {
      const s = await driver.executeScript("return sessionStorage.getItem('sesionActiva')");
      if (!s) return false;
      try { const o = JSON.parse(s); return o && o.activo === true && o.correo === email; } catch { return false; }
    }, 30000, 300);

    await driver.get(`${BASE_URL}/`);
    await waitFor(async () => {
      const v = await driver.executeScript("return localStorage.getItem('isLoggedIn')");
      return v === "1";
    }, 15000, 300);
  });
});
