import puppeteer from 'puppeteer';
import qrcode from 'qrcode-terminal';

export class WhatsAppClient {
    constructor(env) {
        this.env = env;
        this.browser = null;
        this.page = null;
        this.isReady = false;
    }

    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            this.page = await this.browser.newPage();
            await this.page.goto('https://web.whatsapp.com');

            // Wait for QR code
            const qrData = await this.page.waitForSelector('[data-testid="qrcode"]');
            if (qrData) {
                const qrCodeData = await qrData.evaluate(el => el.getAttribute('data-ref'));
                // Display QR in terminal
                qrcode.generate(qrCodeData, { small: true });
            }

            // Wait for successful login
            await this.page.waitForSelector('[data-testid="chat-list"]');
            this.isReady = true;
            console.log('WhatsApp Web Client Ready');
        } catch (error) {
            console.error('Error initializing WhatsApp client:', error);
            throw error;
        }
    }

    async sendMessage(to, message) {
        try {
            if (!this.isReady) {
                throw new Error('WhatsApp client not initialized');
            }

            // Open chat with recipient
            await this.page.goto(`https://web.whatsapp.com/send?phone=${to}`);
            await this.page.waitForSelector('[data-testid="conversation-compose-box-input"]');

            // Type and send message
            await this.page.type('[data-testid="conversation-compose-box-input"]', message);
            await this.page.keyboard.press('Enter');

            return { success: true };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async sendImage(to, imageBuffer) {
        try {
            if (!this.isReady) {
                throw new Error('WhatsApp client not initialized');
            }

            // Open chat
            await this.page.goto(`https://web.whatsapp.com/send?phone=${to}`);

            // Wait for attachment button
            const attachButton = await this.page.waitForSelector('[data-testid="attach-image"]');
            await attachButton.click();

            // Upload image
            const [fileChooser] = await Promise.all([
                this.page.waitForFileChooser(),
                this.page.click('[data-testid="attach-image"]')
            ]);
            await fileChooser.accept([imageBuffer]);

            // Send image
            await this.page.click('[data-testid="send"]');

            return { success: true };
        } catch (error) {
            console.error('Error sending image:', error);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

export default WhatsAppClient;
