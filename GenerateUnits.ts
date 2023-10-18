import puppeteer, { Browser, Page } from "puppeteer";
import LINKS from "./challenge_links.json";

import fs from "fs"
(async () => {
  // Connect to an existing Chrome instance with a remote debugging port
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "ws://127.0.0.1:9222/devtools/browser/{BROWSER_ID}",
  });
  await OpenNewTab(browser, "https://learn.microsoft.com/en-us/");
  let links = [];
  for (const [index, challengeLink] of LINKS.entries()) {
    console.log(`Processing Challange : ${index + 1}/${LINKS.length}`);

    const ChallengePage = await OpenNewTab(browser, challengeLink);
    const modules = await fetchModuleLinks(ChallengePage)

    const modulePromises = modules.map(async (moduleLink, moduleIndex) => {
      console.log(`--  Module: ${moduleIndex + 1}/${modules.length}`);
      const modulePage = await OpenNewTab(browser, moduleLink);
      const units = await fetchUnitLinks(modulePage);
      await modulePage.close();
      return units;
    });
    const allModuleUnits = await Promise.all(modulePromises);
    links.push(allModuleUnits.flat());
    await ChallengePage.close();
  }

  fs.writeFile('units.json', JSON.stringify(links, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to JSON file:', err);
    } else {
      console.log(`Writing ${links.length} unit links in units.json`);
    }
  });

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