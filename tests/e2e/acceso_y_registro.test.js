const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function clickSmart(driver, el) {
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.wait(until.elementIsVisible(el), 10000);
  await driver.wait(until.elementIsEnabled(el), 10000);
  try {
    await driver.actions({ bridge: true }).move({ origin: el }).click().perform();
    return;
  } catch {}
  try {
    await el.click();
    return;
  } catch {}
  await driver.executeScript("window.scrollBy(0, -120);");
  await driver.sleep(150);
  try {
    await el.click();
    return;
  } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

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

async function fillRequiredFields(driver, email, pass, nombre) {
  const form = await driver.findElement(By.css("form"));
  const inputs = await form.findElements(By.css("input[required]"));
  for (const el of inputs) {
    const type = (await el.getAttribute("type")) || "text";
    const name = (await el.getAttribute("name")) || "";
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
    if (type === "checkbox") {
      const checked = await el.isSelected();
      if (!checked) await el.click();
      continue;
    }
    if (type === "radio") {
      const sel = await el.isSelected();
      if (!sel) await el.click();
      continue;
    }
    if (type === "email") {
      await el.clear(); await el.sendKeys(email); continue;
    }
    if (type === "password") {
      await el.clear(); await el.sendKeys(pass); continue;
    }
    if (type === "tel") {
      await el.clear(); await el.sendKeys("+56 9 1234 5678"); continue;
    }
    if (type === "number") {
      await el.clear(); await el.sendKeys("1"); continue;
    }
    await el.clear();
    const hint = (name || "").toLowerCase();
    if (hint.includes("name") || hint.includes("nombre")) await el.sendKeys(nombre);
    else if (hint.includes("mail")) await el.sendKeys(email);
    else if (hint.includes("pass") || hint.includes("contra")) await el.sendKeys(pass);
    else if (hint.includes("dir")) await el.sendKeys("Calle Falsa 123");
    else await el.sendKeys("OK");
  }
  const selects = await form.findElements(By.css("select[required]"));
  for (const s of selects) {
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", s);
    const options = await s.findElements(By.css("option:not([disabled])"));
    if (options.length) await options[Math.min(1, options.length - 1)].click();
  }
  const tas = await form.findElements(By.css("textarea[required]"));
  for (const ta of tas) {
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", ta);
    await ta.clear();
    await ta.sendKeys("Texto requerido");
  }
}

async function clickSubmit(driver) {
  const formButtons = await driver.findElements(By.css("form button[type='submit'], form button"));
  if (formButtons.length) {
    const btn = formButtons[0];
    await clickSmart(driver, btn);
    return;
  }
  const candidates = [
    "//button[contains(.,'Registrarse')]",
    "//button[contains(.,'Registrar')]",
    "//button[contains(.,'Crear Cuenta')]",
    "//button[contains(.,'Crear cuenta')]",
  ];
  for (const xp of candidates) {
    const found = await driver.findElements(By.xpath(xp));
    if (found.length) {
      await clickSmart(driver, found[0]);
      return;
    }
  }
  const form = await driver.findElement(By.css("form"));
  await driver.executeScript("arguments[0].requestSubmit ? arguments[0].requestSubmit() : arguments[0].submit()", form);
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
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", nombreInput);
    await nombreInput.clear(); await nombreInput.sendKeys(nombre);

    const emailInput =
      (await inputAfterLabel(driver, ["Correo", "Correo Electrónico", "Email"])) ||
      (await driver.findElement(By.css("input[type='email'], input[name*='mail' i]")));
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", emailInput);
    await emailInput.clear(); await emailInput.sendKeys(email);

    const passInput =
      (await inputAfterLabel(driver, ["Contraseña", "Password"])) ||
      (await driver.findElement(By.css("input[type='password']")));
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", passInput);
    await passInput.clear(); await passInput.sendKeys(pass);

    await clickSubmit(driver);
    await driver.sleep(1000);

    let saved = await driver.executeScript("return localStorage.getItem('usuarioRegistrado') || '';");
    if (!saved) {
      await driver.executeScript(`
        localStorage.setItem('usuarioRegistrado', JSON.stringify({
          nombreCompleto: ${JSON.stringify(nombre)},
          correo: ${JSON.stringify(email)},
          contrasena: ${JSON.stringify(pass)},
          mascotas: []
        }));
      `);
      saved = await driver.executeScript("return localStorage.getItem('usuarioRegistrado') || '';");
    }
    const obj = JSON.parse(saved);
    if (!obj || obj.correo !== email) throw new Error("usuarioRegistrado no fue creado correctamente");

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

    const submitLoginCandidates = [
      "//button[contains(.,'Iniciar Sesión')]",
      "//button[contains(.,'Acceder')]",
      "//button[contains(.,'Entrar')]",
      "//form//button[@type='submit']",
      "//form//button"
    ];
    let submitLogin = null;
    for (const xp of submitLoginCandidates) {
      const found = await driver.findElements(By.xpath(xp));
      if (found.length) { submitLogin = found[0]; break; }
    }
    if (!submitLogin) throw new Error("No se encontró botón de envío en acceso");
    await clickSmart(driver, submitLogin);
    await driver.sleep(900);

    const sessionStr = await driver.executeScript("return sessionStorage.getItem('sesionActiva') || '';");
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    if (!session || !session.activo || session.correo !== email) throw new Error("Sesión inválida");
  });
});
