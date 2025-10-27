// tests/e2e/acceso_y_registro.test.js
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

async function inputAfterLabel(driver, labelVariants) {
  for (const v of labelVariants) {
    const xp = `//label[contains(normalize-space(.),'${v}')]/following::input[1]`;
    const els = await driver.findElements(By.xpath(xp));
    if (els.length) return els[0];
  }
  return null;
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
    await driver.get(`${BASE_URL}/`);
    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");

    await driver.get(`${BASE_URL}/registro`);
    await driver.sleep(600);

    let nombreInput = await inputAfterLabel(driver, ["Nombre Completo","Nombre"]);
    if (!nombreInput) nombreInput = await driver.findElement(By.css("input[type='text']"));
    await nombreInput.clear(); await nombreInput.sendKeys(nombre);

    let emailInput = await inputAfterLabel(driver, ["Correo","Correo Electrónico","Email"]);
    if (!emailInput) emailInput = await driver.findElement(By.css("input[type='email']"));
    await emailInput.clear(); await emailInput.sendKeys(email);

    let passInput = await inputAfterLabel(driver, ["Contraseña","Password"]);
    if (!passInput) passInput = await driver.findElement(By.css("input[type='password']"));
    await passInput.clear(); await passInput.sendKeys(pass);

    const submitReg =
      (await driver.findElements(By.xpath("//form//button[@type='submit']")))[0] ||
      (await driver.findElements(By.xpath("//button[contains(.,'Registrar') or contains(.,'Registrarse') or contains(.,'Crear')]")))[0];
    await clickSmart(driver, submitReg);
    await driver.sleep(900);

    const savedOk = await driver.wait(async () => {
      const s = await driver.executeScript("return localStorage.getItem('usuarioRegistrado')");
      if (!s) return false;
      try { const o = JSON.parse(s); return o && o.correo === email; } catch { return false; }
    }, 15000);
    if (!savedOk) throw new Error("usuarioRegistrado no fue creado");

    await driver.get(`${BASE_URL}/acceso`);
    await driver.sleep(600);

    let correoEl = await driver.findElements(By.id("correoAcceso"));
    correoEl = correoEl[0] || (await driver.findElements(By.css("input[type='email']")))[0];
    await correoEl.clear(); await correoEl.sendKeys(email);

    let passEl = await driver.findElements(By.id("contrasenaAcceso"));
    passEl = passEl[0] || (await driver.findElements(By.css("input[type='password']")))[0];
    await passEl.clear(); await passEl.sendKeys(pass);

    const submitLogin =
      (await driver.findElements(By.xpath("//form//button[@type='submit']")))[0] ||
      (await driver.findElements(By.xpath("//button[contains(.,'Iniciar') or contains(.,'Acceder') or contains(.,'Entrar')]")))[0];
    await clickSmart(driver, submitLogin);

    await driver.wait(async () => {
      try {
        const s = await driver.executeScript("return sessionStorage.getItem('sesionActiva')");
        if (!s) return false;
        const o = JSON.parse(s);
        return o && o.activo && o.correo === email;
      } catch { return false; }
    }, 20000);
  });
});
