// tests/e2e/acceso_y_registro.test.js
const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitFor(fn, timeout = 25000, interval = 250) {
  const start = Date.now();
  while (true) {
    try {
      if (await fn()) return true;
    } catch {}
    if (Date.now() - start > timeout) throw new Error("waitFor timeout");
    await sleep(interval);
  }
}

async function clickSmart(driver, locatorOrElement) {
  const el =
    locatorOrElement instanceof By
      ? await driver.findElement(locatorOrElement)
      : locatorOrElement;
  await driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    el
  );
  await driver.wait(until.elementIsVisible(el), 15000);
  try {
    await el.click();
    return;
  } catch {}
  try {
    await driver
      .actions({ bridge: true })
      .move({ origin: el })
      .click()
      .perform();
    return;
  } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

async function findFirstExistingPath(
  driver,
  paths,
  detector,
  timeoutPerPath = 6000
) {
  for (const p of paths) {
    try {
      await driver.get(`${BASE_URL}${p}`);
      await driver.wait(async () => {
        const ready = await driver.executeScript("return document.readyState");
        return ready === "complete";
      }, 4000);
      const ok = await Promise.race([
        (async () => !!(await detector()))(),
        (async () => {
          await sleep(timeoutPerPath);
          return false;
        })(),
      ]);
      if (ok) return p;
    } catch {}
  }
  return null;
}

async function findFirst(driver, locators, timeout = 8000) {
  for (const css of locators) {
    try {
      const by = By.css(css);
      await driver.wait(until.elementLocated(by), 1500);
      const el = await driver.findElement(by);
      return el;
    } catch {}
  }
  return null;
}

async function setValue(el, value) {
  await el.clear();
  await el.sendKeys(value);
}

async function anySuccessSignal(driver, email) {
  // 1) .alert-success o cualquier role="alert" con mensaje de éxito
  try {
    const candidates = [
      ".alert-success",
      "[role='alert'].alert-success",
      ".toast.show, .toast-body, .alert",
    ];
    for (const c of candidates) {
      const els = await driver.findElements(By.css(c));
      for (const el of els) {
        const txt = (await el.getText()).toLowerCase();
        if (
          /éxito|exito|bienvenido|iniciaste|sesión iniciada|sesion iniciada/.test(
            txt
          )
        )
          return true;
      }
    }
  } catch {}

  // 2) Ver si redirigió a home/perfil y aparece el nombre o correo en la navbar
  try {
    const bodyText = (
      await driver.findElement(By.css("body")).getText()
    ).toLowerCase();
    if (bodyText.includes(email.toLowerCase())) return true;
    if (/mi cuenta|perfil|cerrar sesión|cerrar sesion/.test(bodyText))
      return true;
  } catch {}

  // 3) Storage: intenta múltiples claves comunes
  try {
    const found = await driver.executeScript(`
      const keys = [
        'sesionActiva','session','auth','usuarioActual','user','currentUser',
        'kps_sesion','kps_user','userSession','loggedInUser','login'
      ];
      const out = { ss: {}, ls: {} };
      for (const k of keys) {
        try { out.ss[k] = sessionStorage.getItem(k); } catch {}
        try { out.ls[k] = localStorage.getItem(k); } catch {}
      }
      return out;
    `);
    const checkObj = (s) => {
      try {
        const o = JSON.parse(s);
        if (!o) return false;
        if (o.activo === true) return true;
        if (o.logged === true) return true;
        if (o.isAuth === true) return true;
        if ((o.correo || o.email) && (o.correo === email || o.email === email))
          return true;
      } catch {}
      if (typeof s === "string" && s.includes(email)) return true;
      return false;
    };
    for (const dict of [found.ss, found.ls]) {
      for (const k of Object.keys(dict || {})) {
        const v = dict[k];
        if (v && checkObj(v)) return true;
      }
    }
  } catch {}

  return false;
}

describe("Registro y acceso (robusto)", function () {
  this.timeout(180000);
  let driver;

  const email = `e2e${Date.now()}@gmail.com`;
  const pass = `P@ssw0rd!${Date.now()}`;
  const nombre = "Usuario Prueba";

  before(async () => {
    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    );
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Registra (si hay formulario) y accede correctamente", async function () {
    await driver.get(BASE_URL);
    await driver.executeScript(
      "try{localStorage.clear();sessionStorage.clear();}catch(e){}"
    );

    const registroPaths = [
      "/registro",
      "/registrarse",
      "/signup",
      "/cuenta/registro",
    ];
    const accesoPaths = [
      "/acceso",
      "/login",
      "/iniciar-sesion",
      "/cuenta/acceso",
    ];

    const registroPath = await findFirstExistingPath(
      driver,
      registroPaths,
      async () => {
        const emailEl = await findFirst(driver, [
          "input[type='email']",
          "input[name='email']",
          "input[id*='mail']",
          "input[placeholder*='mail' i]",
          "input[placeholder*='correo' i]",
        ]);
        const passEl = await findFirst(driver, [
          "input[type='password']",
          "input[name='password']",
          "input[id*='pass']",
          "input[placeholder*='contraseña' i]",
          "input[placeholder*='password' i]",
        ]);
        const nameEl = await findFirst(driver, [
          "input[name='nombre']",
          "input[id*='nombre']",
          "input[placeholder*='nombre' i]",
          "input[name='fullname']",
          "input[id*='name']",
        ]);
        // Considera formulario de registro si hay al menos email + password; nombre es opcional
        return !!(emailEl && passEl);
      }
    );

    let userExists = false;

    if (registroPath) {
      // Intentar registrar por UI
      const emailEl = await findFirst(driver, [
        "input[type='email']",
        "input[name='email']",
        "input[id*='mail']",
        "input[placeholder*='mail' i]",
        "input[placeholder*='correo' i]",
      ]);
      const passEl = await findFirst(driver, [
        "input[type='password']",
        "input[name='password']",
        "input[id*='pass']",
        "input[placeholder*='contraseña' i]",
        "input[placeholder*='password' i]",
      ]);
      const nameEl = await findFirst(driver, [
        "input[name='nombre']",
        "input[id*='nombre']",
        "input[placeholder*='nombre' i]",
        "input[name='fullname']",
        "input[id*='name']",
      ]);

      if (nameEl) await setValue(nameEl, nombre);
      await setValue(emailEl, email);
      await setValue(passEl, pass);

      const confirmEl = await findFirst(driver, [
        "input[name='confirm']",
        "input[id*='confirm']",
        "input[placeholder*='confirm' i]",
        "input[placeholder*='repet' i]",
      ]);
      if (confirmEl) await setValue(confirmEl, pass);

      const submitEl =
        (await findFirst(driver, ["button[type='submit']"])) ||
        (await findFirst(driver, ["button", "input[type='submit']"]));
      if (submitEl) {
        await clickSmart(driver, submitEl);
        // Si el registro falla por duplicado, igual seguimos al login
        await sleep(1500);
      }
    } else {
      // Fallback: inyectar usuario en storage (formatos comunes)
      await driver.executeScript(
        `
        try {
          const payload = { nombreCompleto: arguments[0], correo: arguments[1], email: arguments[1], contrasena: arguments[2], password: arguments[2] };
          localStorage.setItem('usuarioRegistrado', JSON.stringify(payload));
          const arr = JSON.parse(localStorage.getItem('usuarios')||'[]');
          arr.push({ nombre: arguments[0], apellido: 'E2E', correo: arguments[1], email: arguments[1], password: arguments[2], contrasena: arguments[2] });
          localStorage.setItem('usuarios', JSON.stringify(arr));
        } catch(e) {}
      `,
        nombre,
        email,
        pass
      );

      await waitFor(
        async () => {
          const s1 = await driver.executeScript(
            "return localStorage.getItem('usuarioRegistrado')"
          );
          const s2 = await driver.executeScript(
            "return localStorage.getItem('usuarios')"
          );
          return !!(s1 || s2);
        },
        12000,
        300
      );
      userExists = true;
    }

    const accesoPath = await findFirstExistingPath(
      driver,
      accesoPaths,
      async () => {
        const emailEl = await findFirst(driver, [
          "input[type='email']",
          "input[name='email']",
          "input[id*='mail']",
          "input[placeholder*='mail' i]",
          "input[placeholder*='correo' i]",
        ]);
        const passEl = await findFirst(driver, [
          "input[type='password']",
          "input[name='password']",
          "input[id*='pass']",
          "input[placeholder*='contraseña' i]",
          "input[placeholder*='password' i]",
        ]);
        return !!(emailEl && passEl);
      }
    );

    if (!accesoPath)
      throw new Error("No se encontró la página de acceso/login");

    const emailEl2 = await findFirst(driver, [
      "input[type='email']",
      "input[name='email']",
      "input[id*='mail']",
      "input[placeholder*='mail' i]",
      "input[placeholder*='correo' i]",
    ]);
    const passEl2 = await findFirst(driver, [
      "input[type='password']",
      "input[name='password']",
      "input[id*='pass']",
      "input[placeholder*='contraseña' i]",
      "input[placeholder*='password' i]",
    ]);

    await setValue(emailEl2, email);
    await setValue(passEl2, pass);

    const submitLogin =
      (await findFirst(driver, ["form button[type='submit']"])) ||
      (await findFirst(driver, ["button[type='submit']"])) ||
      (await findFirst(driver, ["button"])) ||
      (await findFirst(driver, ["[data-testid='login-submit']"]));

    if (!submitLogin)
      throw new Error("No se encontró el botón de envío en acceso");

    await clickSmart(driver, submitLogin);

    await waitFor(
      async () => await anySuccessSignal(driver, email),
      30000,
      400
    );

    // Señal adicional: si tras login aparece un botón de "Cerrar sesión", considéralo éxito
    const bodyTxt = (
      await driver.findElement(By.css("body")).getText()
    ).toLowerCase();
    if (!/cerrar sesión|cerrar sesion|mi cuenta|perfil/.test(bodyTxt)) {
      // Igual es válido si storage confirma
      const ok = await anySuccessSignal(driver, email);
      if (!ok) throw new Error("No se detectó confirmación de login");
    }
  });
});
