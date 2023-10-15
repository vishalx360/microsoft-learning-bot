import puppeteer, { Browser, Page } from "puppeteer";
import LINKS from "./links.json";

(async () => {
  // Connect to an existing Chrome instance with a remote debugging port
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "ws://127.0.0.1:9222/devtools/browser/cf04de77-d505-4984-8e5b-5b81535cf7f5",
  });

  // Perform other actions on the page if needed
  const completePromises = LINKS.map((link) => CompleteChallenge(browser, link));
  await Promise.all(completePromises);

})();

async function CompleteChallenge(browser: Browser, currentLink: string) {
  try {
    // Create a new page or access an existing page
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    await page.setViewport({
      width: 1920, // Width of your screen
      height: 1080, // Height of your screen
      deviceScaleFactor: 1, // Optional, can be 2 for high-DPI displays
    });

    // Navigate to the challenge page
    await page.goto(currentLink);
    await new Promise(r => setTimeout(r, 5000));

    // Get the all link of modules
    const Modules = await page.evaluate(() => {
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

    console.log('Module Links:', Modules);
    // Iterate through each module
    for (const moduleLink of Modules) {
      console.log("Going to module: ", moduleLink);
      // Navigate to the challenge page
      const page = await browser.newPage();

      await page.setViewport({
        width: 1920, // Width of your screen
        height: 1080, // Height of your screen
        deviceScaleFactor: 1, // Optional, can be 2 for high-DPI displays
      });

      // Navigate to the challenge page
      await page.goto(moduleLink);
      await new Promise(r => setTimeout(r, 3000));


      // Get the all link of lessons
      // ul with id "unit-list" > search for all a tags > get the href attribute
      const Units = await page.evaluate(() => {
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
      console.log('Unit Links:');
      console.log(Units)

      for (const unitLink of Units) {
        console.log("Going to unit: ", unitLink);
        // Navigate to the challenge page
        const page = await browser.newPage();

        await page.setViewport({
          width: 1920, // Width of your screen
          height: 1080, // Height of your screen
          deviceScaleFactor: 1, // Optional, can be 2 for high-DPI displays
        });

        // Navigate to the unit page
        await page.goto(unitLink);
        await new Promise(r => setTimeout(r, 3000));
        await checkRadioGroups(page);
        await new Promise(r => setTimeout(r, 1000));
        page.close();
      }
      // Go back to the modules page
      page.close();
      new Promise(r => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


// check if there are any div with role="radiogroup" attribute and check first input type="radio" element
async function checkRadioGroups(page: Page) {
  try {
    const radioGroups = await page.evaluate(() => {
      const divsWithRoleRadioGroup = Array.from(document.querySelectorAll('div[role="radiogroup"]'));
      const result = [];

      divsWithRoleRadioGroup.forEach(radioGroup => {
        const firstRadio = radioGroup.querySelector('input[type="radio"]');
        if (firstRadio) {
          firstRadio.click(); // Click the first radio input
          result.push({ isChecked: firstRadio.checked });
        }
      });

      return result;
    });

    console.log('Radio Groups:');
    radioGroups.forEach(radioGroup => {
      console.log('First radio input is checked:', radioGroup.isChecked);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}