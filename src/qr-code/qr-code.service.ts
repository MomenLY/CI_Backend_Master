import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQRCode(payload: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(payload);
      return qrCodeDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw err;
    }
  }

  async generateQRCodeToFile(payload: string, filePath: string): Promise<void> {
    try {
      await QRCode.toFile(filePath, payload);
    } catch (err) {
      console.error('Error generating QR code to file:', err);
      throw err;
    }
  }
}
