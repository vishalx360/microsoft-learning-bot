import puppeteer, { Browser, Page } from "puppeteer";
import LINKS from "./links.json";

(async () => {
  // Connect to an existing Chrome instance with a remote debugging port
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "ws://127.0.0.1:9222/devtools/browser/b90c1626-3b68-4f35-b104-99a8a71e89a0",
  });
  await OpenNewTab(browser, "https://learn.microsoft.com/en-us/");

  for (const [index, challengeLink] of LINKS.entries()) {
    console.log(`Processing Challange : ${index + 1}/${LINKS.length}`);

    const ChallengePage = await OpenNewTab(browser, challengeLink);
    const Modules = await fetchModuleLinks(ChallengePage)

    for (const [index, moduleLink] of Modules.entries()) {
      console.log(`--  Module : ${index + 1}/${Modules.length}`);

      const ModulePage = await OpenNewTab(browser, moduleLink);
      const Units = await fetchUnitLinks(ModulePage);

      const unitPromises = Units.map(async (unitLink, unitIndex) => {
        console.log(` --- Unit : ${unitIndex + 1}/${Units.length}`);
        const UnitPage = await OpenNewTab(browser, unitLink);
        await checkRadioGroups(UnitPage);
        UnitPage.close();
      });

      await Promise.all(unitPromises);

      await ModulePage.close();
    }
    await ChallengePage.close();
  }
})().catch(err => {
  console.error(err);
});

async function OpenNewTab(browser: Browser, link: string) {
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await page.goto(link, {
    waitUntil: 'networkidle0',
    timeout: 120000,
  });
  return page;
}
async function fetchUnitLinks(page: Page) {
  return await page.evaluate(() => {
    const unitList = document.querySelector('ul#unit-list');
    if (!unitList) return [];

    const anchorElements = unitList.querySelectorAll('a');
    const hrefList = [];

    for (const anchor of anchorElements) {
      const href = anchor.getAttribute('href');
      if (href) {
        hrefList.push("https://" + document.location.host + document.location.pathname + href);
      }
    }
    return hrefList;
  });
}
async function fetchModuleLinks(page: Page) {
  return await page.evaluate(() => {
    const linkElements = document.querySelectorAll('a');
    const moduleLinks = [];

    for (const link of linkElements) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/en-us/training/modules/')) {
        moduleLinks.push("https://learn.microsoft.com" + href);
      }
    }
    return moduleLinks;
  });
}
// check if there are any div with role="radiogroup" attribute and check first input type="radio" element
async function checkRadioGroups(page: Page) {
  try {
    await page.evaluate(async () => {
      const divsWithRoleRadioGroup = Array.from(document.querySelectorAll('div[role="radiogroup"]'));
      if (divsWithRoleRadioGroup.length > 0) {
        divsWithRoleRadioGroup.forEach(radioGroup => {
          const firstRadio = radioGroup.querySelector('input[type="radio"]');
          if (firstRadio) firstRadio.click();
        });
        console.log(`   --- Checked ${divsWithRoleRadioGroup.length} MCQ answers`);
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent.includes("Check your answers")) {
            // Found the button with the desired text
            button.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            break; // To stop searching once the first matching button is found
          }
        }
      }
    });
    await page.waitForNetworkIdle()
  } catch (error) {
    console.error('Error:', error);
  }
}