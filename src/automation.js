const puppeteer = require('puppeteer');

async function automateWebTasks() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: "new", // Use new headless mode
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Enable console log in the browser
    page.on('console', msg => console.log('Browser log:', msg.text()));

    // Navigate to a website
    await page.goto('https://example.com');

    // Wait for specific element to be rendered
    await page.waitForSelector('h1');

    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png' });

    // Extract text content
    const title = await page.$eval('h1', el => el.textContent);
    console.log('Page title:', title);

    // Fill out a form (example)
    await page.type('input[name="search"]', 'test query');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation();

    // Extract data from multiple elements
    const links = await page.$$eval('a', elements => 
      elements.map(el => ({
        text: el.textContent,
        href: el.href
      }))
    );
    console.log('Found links:', links);

    // Download PDF
    await page.pdf({
      path: 'page.pdf',
      format: 'A4'
    });

    // Example of handling dynamic content
    await page.waitForFunction(() => {
      const element = document.querySelector('.dynamic-content');
      return element && element.textContent.includes('loaded');
    });

    // Example of intercepting network requests
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.resourceType() === 'image') {
        request.abort(); // Block image loading
      } else {
        request.continue(); // Allow other requests
      }
    });

  } catch (error) {
    console.error('Automation failed:', error);
  } finally {
    // Always close the browser
    await browser.close();
  }
}

// Run the automation
automateWebTasks().catch(console.error);

// Example of handling multiple pages
async function multiPageAutomation() {
  const browser = await puppeteer.launch();
  
  try {
    // Open multiple pages in parallel
    const pages = await Promise.all(
      Array(3).fill().map(() => browser.newPage())
    );

    // Navigate to different URLs simultaneously
    await Promise.all(
      pages.map((page, i) => 
        page.goto(`https://example.com/page${i + 1}`)
      )
    );

    // Extract data from all pages
    const results = await Promise.all(
      pages.map(page => 
        page.$eval('h1', el => el.textContent)
      )
    );

    console.log('Results from multiple pages:', results);

  } finally {
    await browser.close();
  }
}