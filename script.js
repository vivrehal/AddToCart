const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

// Product URL on Cashify (Update this if needed)
const productUrl = 'https://www.cashify.in/buy-refurbished-mobile-phones/renewed-apple-iphone-15';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail's SMTP server
    port: 465, // Use 587 for TLS
    secure: true, // Use true for 465, false for other ports
    auth: {
        user: 'vivek1552.be21@chitkara.edu.in', // Your Gmail address
        pass: 'dmbptdrsegnvpkzb', // Your app-specific password or regular password
    },
});

const mailOptions = {
    from: 'vivek1552.be21@chitkara.edu.in',
    to: 'dhimanvivek777@gmail.com',
    subject: 'iPhone Available - Added to Cart!',
    text: 'The iPhone is in stock and has been added to your cart on Cashify!',
};

// Function to check stock status and add to cart
async function checkStock() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Navigate to the product page
        await page.goto(productUrl, { waitUntil: 'networkidle2' });




        // Using a buttons reliable selector
        const buttons = await page.$$('#lego-ripple > div > button'); // Replace with the correct selector if needed


        const addToCartButton = await Promise.all(
            buttons.map(async (button) => {
                const text = await button.evaluate(el => el.innerText);
                console.log('Button text:', text);
                return text === 'Notify Me!' ? button : null; // Replace 'Add to Cart' with the actual text you are looking for
            })
        ).then(results => results.filter(Boolean)); 

        const firstDivSelector = '#__csh > main > main > div > div > div:nth-child(3) > div:nth-child(3) > div:nth-child(3) > div > div > div:nth-child(3) > div > div:nth-child(3) > div > div > div';
        const secondDivSelector = '#__csh > main > main > div > div > div:nth-child(3) > div:nth-child(3) > div:nth-child(3) > div > div > div.flex.flex-row.flex-wrap.gap-2\\.5 > div.text-center.py-2.px-2\\.5.sm\\:px-4.h4.sm\\:h3.rounded-md.border.bg-primary-bg.border-secondary.bg-secondary\\/10.opacity-50.flex.flex-col > span';

        // Check if the Add to Cart button exists
        if (addToCartButton.length > 0) {

            const firstElement = await page.$(firstDivSelector);
            if (!firstElement) {
               console.log('First element not found');
            }
            const firstElementText = await page.evaluate(el => el?.innerText, firstElement);
            console.log('First element text:', firstElementText);
            // Click the first div
            if(firstElementText)await firstElement.click();


            const secondElement = await page.$(secondDivSelector);
            if (!secondElement) {
                console.log('Second element not found');
            }
            const secondElementText = await page.evaluate(el => el?.innerText, secondElement);
            console.log('Second element text:', secondElementText);
            // Click the second element if it's available
            if(secondElementText)await secondElement.click();

            await addToCartButton[0].click();
            console.log('iPhone is in stock! Proceeding to add to cart...');

            // Click the Add to Cart button

            // Send an email notification
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Notification sent: ' + info.response);
                }
            });
        } else {
            console.log('iPhone is out of stock. Will check again later.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

// Schedule the script to run every 5 minutes
setInterval(checkStock, 60 * 1000);  // 5 minutes in milliseconds

// Run the script initially
checkStock();
