const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Flujo carrito - agregar y pagar", function () {
  this.timeout(120000); // más aire para CI
  let driver;

  // Helpers
  const waitVisible = async (locator, ms = 20000) => {
    const el = await driver.wait(until.elementLocated(locator), ms);
    await driver.wait(until.elementIsVisible(el), ms);
    return el;
  };

  const scrollAndClick = async (locator) => {
    const el = await waitVisible(locator);
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
    await driver.wait(until.elementIsEnabled(el), 10000);
    await el.click();
  };

  before(async () => {
    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1366,900" // ⬅️ fuerza layout de escritorio
    );

    const service = new chrome.ServiceBuilder(chromedriver.path).build();

    // builder v4 compatible + fallback estable
    try {
      if (typeof new Builder().setChromeService === "function") {
        driver = await new Builder()
          .forBrowser("chrome")
          .setChromeOptions(options)
          .setChromeService(service)
          .build();
      } else {
        driver = await chrome.Driver.createSession(options, service);
      }
    } catch (_) {
      driver = await chrome.Driver.createSession(options, service);
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Abre home y navega a Productos", async () => {
    await driver.get(BASE_URL);

    // En desktop debería existir el link visible en el header
    const linkProductos = By.xpath(
      "//nav//a[contains(.,'Productos') and not(ancestor-or-self::*[contains(@class,'d-lg-none')])]"
    );
    await scrollAndClick(linkProductos);

    // Confirmamos que aparecen cards con botón Añadir/Agregar
    const botonAgregar = By.xpath("//button[contains(.,'Añadir') or contains(.,'Agregar')]");
    await waitVisible(botonAgregar);
  });

  it("Agrega el primer producto", async () => {
    // Aseguramos que haya inventario en pantalla
    const cardAny = By.xpath("(//div[contains(@class,'product-card')])[1]");
    await waitVisible(cardAny);

    // si existe +, lo tocamos para subir a 1
    const plusBtn = By.xpath(
      "(//button[contains(@class,'outline-primary') and .//i[contains(@class,'fa-plus')]])[1]"
    );
    try {
      const elPlus = await driver.findElements(plusBtn);
      if (elPlus.length) {
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", elPlus[0]);
        await elPlus[0].click();
      }
    } catch {}

    // click en el primer botón Añadir/Agregar visible
    const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await scrollAndClick(addBtn);
  });

  it("Va al carrito desde el header y ve la página de pago", async () => {
    const linkCarrito = By.xpath(
      "//nav//a[contains(.,'Mi carrito') or contains(.,'carrito')]"
    );
    await scrollAndClick(linkCarrito);

    // Espera a que aparezca algo típico del checkout
    const marcadorPago = By.xpath(
      "//*[contains(.,'Total') or contains(.,'Pagar') or contains(.,'Resumen')]"
    );
    await waitVisible(marcadorPago);
  });
});

