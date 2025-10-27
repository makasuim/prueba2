const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function byText(driver, variants, tag = "*", timeout = 30000) {
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

async function inputAfterLabel(driver, labelVariants) {
  for (const v of labelVariants) {
    const xp = `//label[contains(normalize-space(.),'${v}')]/following::input[1]`;
    const els = await driver.findElements(By.xpath(xp));
    if (els.length) return els[0];
  }
  const all = await driver.findElements(By.css("form input"));
  return all.length ? all[0] : null;
}

describe("Registro y acceso", function () {
  this.timeout(120000);
  let driver;
  const email = `e2e${Date.now()}@gmail.com`;
  const pass = `P@ssw0rd!${Date.now()}`;
  const nombre = "Usuario Prueba";

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Registra y luego accede correctamente", async function () {
    await driver.get(`${BASE_URL}/`);
    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");

    await driver.get(`${BASE_URL}/registro`);
    await driver.sleep(700);

    const nombreInput = (await inputAfterLabel(driver, ["Nombre Completo", "Nombre"])) || (await driver.findElement(By.css("input[type='text']")));
    await nombreInput.clear(); await nombreInput.sendKeys(nombre);

    const emailInput =
      (await inputAfterLabel(driver, ["Correo", "Correo Electrónico", "Email"])) ||
      (await driver.findElement(By.css("input[type='email'], input[name*='mail' i]")));
    await emailInput.clear(); await emailInput.sendKeys(email);

    const passInput =
      (await inputAfterLabel(driver, ["Contraseña", "Password"])) ||
      (await driver.findElement(By.css("input[type='password']")));
    await passInput.clear(); await passInput.sendKeys(pass);

    const submitRegistro =
      (await byText(driver, ["Registrarse", "Registrar", "Crear Cuenta", "Crear cuenta"], "button")) ||
      (await driver.findElement(By.css("form button[type='submit'], form button")));
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", submitRegistro);
    await driver.sleep(300);
    await driver.actions({ bridge: true }).move({ origin: submitRegistro }).click().perform();

    await driver.sleep(900);

    const saved = await driver.executeScript("return localStorage.getItem('usuarioRegistrado') || '';");
    if (!saved) throw new Error("usuarioRegistrado no fue creado");
    const obj = JSON.parse(saved);
    if (!obj || obj.correo !== email) throw new Error("El correo registrado no coincide");

    await driver.get(`${BASE_URL}/acceso`);
    await driver.sleep(700);

    let correoEl;
    try { correoEl = await driver.findElement(By.id("correoAcceso")); }
    catch { correoEl = await driver.findElement(By.css("input[type='email'], input[name*='mail' i]")); }
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", correoEl);
    await correoEl.clear(); await correoEl.sendKeys(email);

    let passEl;
    try { passEl = await driver.findElement(By.id("contrasenaAcceso")); }
    catch { passEl = await driver.findElement(By.css("input[type='password']")); }
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", passEl);
    await passEl.clear(); await passEl.sendKeys(pass);

    const submitLogin =
      (await byText(driver, ["Iniciar Sesión", "Acceder", "Entrar"], "button")) ||
      (await driver.findElement(By.css("form button[type='submit'], form button")));
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", submitLogin);
    await driver.sleep(200);
    await driver.actions({ bridge: true }).move({ origin: submitLogin }).click().perform();

    await driver.sleep(900);

    const sessionStr = await driver.executeScript("return sessionStorage.getItem('sesionActiva') || '';");
    if (!sessionStr) throw new Error("sesionActiva no fue creada");
    const session = JSON.parse(sessionStr);
    if (!session.activo || session.correo !== email) throw new Error("Sesión inválida");
  });
});
