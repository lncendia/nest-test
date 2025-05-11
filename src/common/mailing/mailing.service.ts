import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailingOptions } from './mailing.interface';
import { MAILING_OPTIONS } from './mailing.constants';
import Handlebars from 'handlebars';
import { Email } from './email.interface';

@Injectable()
export class MailingService {
  private transporter: nodemailer.Transporter;

  constructor(@Inject(MAILING_OPTIONS) private options: MailingOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.auth,
    });
  }

  async send(to: string, email: Email) {
    Handlebars.compile();
    await this.transporter.sendMail({
      from: this.options.from,
      to,
      subject,
      html,
    });
  }
}
