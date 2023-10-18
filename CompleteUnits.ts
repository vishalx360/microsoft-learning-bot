import puppeteer, { Browser, Page } from "puppeteer";
import LINKS from "./data/unit_links.json";
import dotenv from "dotenv";
dotenv.config();
const BROWSER_ID = process.env.BROWSER_ID;

if (!BROWSER_ID) {
    throw new Error("BROWSER_ID not found in .env file")
}

(async () => {
    // Connect to an existing Chrome instance with a remote debugging port
    const browser = await puppeteer.connect({
        browserWSEndpoint:
            `ws://127.0.0.1:9222/devtools/browser/${BROWSER_ID}`,
    });
    await OpenNewTab(browser, "https://learn.microsoft.com/en-us/");

    const batchSize = 50;
    const Links = LINKS.flat().slice(440 + 160 + 120 + 540 + 40)
    processLinksInBatches(Links, batchSize)
        .then(() => console.log("All links processed successfully"))
        .catch((err) => console.error("Error:", err));

    async function processLinksInBatches(links, batchSize) {
        for (let i = 0; i < links.length; i += batchSize) {
            const batch = links.slice(i, i + batchSize);
            const promises = batch.map((link, index) => {
                return processLink(link, i + index);
            });
            await Promise.all(promises);
        }
    }
    async function processLink(link, index) {
        console.log(`Processing link ${index + 1}/${Links.length} : ${String(link).slice(0, 50)}`);
        const UnitPage = await OpenNewTab(browser, link);
        await checkRadioGroups(UnitPage);
        await UnitPage.close();
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

