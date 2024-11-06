import { expect } from 'chai';
import { unstable_dev } from 'wrangler';

describe('QR Code Worker', () => {
  let worker;

  before(async () => {
    worker = await unstable_dev('src/worker.js', {
      experimental: { disableExperimentalWarning: true }
    });
  });

  after(async () => {
    await worker.stop();
  });

  it('should serve the QR code landing page', async () => {
    const resp = await worker.fetch('/qr');
    expect(resp.status).to.equal(200);
    expect(resp.headers.get('content-type')).to.include('text/html');
  });

  it('should generate a QR code', async () => {
    const resp = await worker.fetch('/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'https://example.com' })
    });
    expect(resp.status).to.equal(200);
    expect(resp.headers.get('content-type')).to.include('image/png');
  });
});
