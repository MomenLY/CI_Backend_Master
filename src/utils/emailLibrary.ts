import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { GlobalService } from './global.service';
import { ErrorMessages, SuccessMessages } from './messages';

@Injectable()
export class EmailLibrary {
  constructor() {}

  async sendEmail(payload: any): Promise<any> {
    const response = {
      error: false,
      message: SuccessMessages.EMAIL_SENT_SUCCESSFULLY,
    };
    const emailEndPoint = `${process.env.EMAIL_SERVICE_URL}/email/send`;
    try {
      if (!GlobalService.emailSubscription) {
        throw new BadRequestException(
          ErrorMessages.EMAIL_SUBSCRIPTION_NOT_FOUND,
        );
      } else {
        payload.templateCode = payload.Template;
        payload.data = {
          userName: payload.TemplateData.receiverName,
          url: payload.TemplateData.url ? payload.TemplateData.url : null,
          resetPassword: payload.TemplateData.resetPassword ? payload.TemplateData.resetPassword : null
        };
        payload.to = [payload.recipientEmail];
        payload.cc ? (payload.cc = [payload.cc]) : '';
        payload.bcc ? (payload.bcc = [payload.bcc]) : '';
        payload.multiThread = false;

        const authCode = GlobalService.emailSubscription.SAuthCode;
        const emailServiceResponse = await axios.post(emailEndPoint, payload, {
          headers: {
            'x-tenant-id': process.env.TENANT_ID,
            'Auth-Code': authCode,
          },
        });
        response['data'] = emailServiceResponse.data;
      }
    } catch (e) {
      response['error'] = true;
      response['message'] = e.message;
    }
    return response;
  }
}
