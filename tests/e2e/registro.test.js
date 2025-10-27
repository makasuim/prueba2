// tests/e2e/registro_success.test.js
const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function byText(driver, variants, tag = "*", timeout = 25000) {
  for (const v of variants) {
    const xp = `//${tag}[contains(normalize-space(.),'${v}')]`;
    try {
      const loc = By.xpath(xp);
      await driver.wait(until.elementLocated(loc), timeout);
      return await driver.findElement(loc);
    } catch {}
  }
  return null;
}

async function inputAfterLabel(driver, labelVariants, timeout = 25000) {
  for (const v of labelVariants) {
    const xp = `//label[contains(normalize-space(.),'${v}')]/following::input[1]`;
    const els = await driver.findElements(By.xpath(xp));
    if (els.length) return els[0];
  }
  await driver.sleep(200);
  for (const v of labelVariants) {
    const xp = `//*[self::label or self::*][contains(normalize-space(.),'${v}')]/following::input[1]`;
    const els = await driver.findElements(By.xpath(xp));
    if (els.length) return els[0];
  }
  await driver.wait(until.elementLocated(By.css("form input")), timeout);
  const all = await driver.findElements(By.css("form input"));
  return all[0];
}

describe("Registro correcto", function () {
  this.timeout(90000);
  let driver;
  const email = `test${Date.now()}@gmail.com`;
  const pass = `P@ssw0rd${Date.now()}`;
  const nombre = "Usuario Prueba";

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Completa el registro y guarda el usuario", async function () {
    await driver.get(`${BASE_URL}/`);
    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
    await driver.get(`${BASE_URL}/registro`);
    await driver.sleep(600);

    const nombreInput = await inputAfterLabel(driver, ["Nombre Completo", "Nombre"]);
    await nombreInput.clear(); await nombreInput.sendKeys(nombre);

    let emailInput = await inputAfterLabel(driver, ["Correo", "Email"]);
    await emailInput.clear(); await emailInput.sendKeys(email);

    let passInput = await inputAfterLabel(driver, ["Contraseña", "Password"]);
    await passInput.clear(); await passInput.sendKeys(pass);

    const submit =
      (await byText(driver, ["Registrarse", "Registrar", "Crear Cuenta", "Crear cuenta"], "button")) ||
      (await driver.findElement(By.css("form button[type='submit'], form button")));
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", submit);
    await driver.sleep(300);
    await driver.actions({ bridge: true }).move({ origin: submit }).click().perform();

    await driver.sleep(800);

    const saved = await driver.executeScript("return localStorage.getItem('usuarioRegistrado') || '';");
    if (!saved) throw new Error("usuarioRegistrado no fue creado");
    const obj = JSON.parse(saved);
    if (!obj || obj.correo !== email) throw new Error("El correo registrado no coincide");
  });
});
