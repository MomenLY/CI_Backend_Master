import { Body, Controller, Post, Res } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { Response } from 'express';

@Controller('qr-code')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post()
  async generateQRCode(@Body() createQrCodeDto: CreateQrCodeDto, @Res() res: Response) {
    console.log(createQrCodeDto, "generateQRCode");
    const { payload } = createQrCodeDto;
    try {
      const qrCodeDataUrl = await this.qrCodeService.generateQRCode(payload);
      res.type('image/png');
      res.send(qrCodeDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      res.status(500).send('Error generating QR code');
    }
  }
}
