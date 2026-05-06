import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'e2e',
    use: {
        baseURL: 'http://127.0.0.1:8080'
    },
    webServer: {
        command: 'npm start',
        port: 8080,
        reuseExistingServer: true
    },
    projects: [
        {
            name: 'Chrome Stable',
            use: {
                browserName: 'chromium',
                channel: 'chrome',
                viewport: { width: 480, height: 640 },
                headless: true
            }
        }
    ]
});
