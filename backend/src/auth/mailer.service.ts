import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  async sendHtml(to: string, subject: string, html: string) {
    const fromEmail = process.env.NODEMAILER_EMAIL;
    if (!fromEmail || !process.env.NODEMAILER_PASSWORD) {
      throw new InternalServerErrorException(
        'Mailer configuration missing. Set NODEMAILER_EMAIL and NODEMAILER_PASSWORD.',
      );
    }

    try {
      await this.transporter.sendMail({
        from: `bayut <${fromEmail}>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to send email: ${message}`,
      );
    }
  }
}
