import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendInvitationEmailOptions {
  to: string;
  inviterName: string;
  orgName: string;
  roleName: string;
  token: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<number>('SMTP_PORT', 587));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secureConfig = this.configService.get<string>('SMTP_SECURE');
    const secure = secureConfig === 'true' || port === 465;

    if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: sendgridApiKey,
        },
      });
      this.logger.log('SendGrid SMTP Transporter initialized using SENDGRID_API_KEY');
    } else if (host && host !== 'localhost' && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      this.logger.log(`SMTP Transporter initialized for ${host}:${port} (user: ${user})`);
    } else if (host === 'smtp.gmail.com' && user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`Gmail Service Transporter initialized for ${user}`);
    } else {
      this.logger.warn('SMTP credentials not fully configured in .env. Invitation links will be logged to server console in dev mode.');
    }
  }

  async onModuleInit() {
    if (this.transporter) {
      try {
        await this.transporter.verify();
        this.logger.log('✅ Email service connection verified successfully! Ready to deliver real emails to inboxes.');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`❌ Email transport verification failed: ${errorMsg}`);
        if (errorMsg.includes('535') || errorMsg.includes('BadCredentials') || errorMsg.includes('Username and Password not accepted')) {
          this.logger.error(
            '💡 HINT: Check your API Key or password credentials.',
          );
        } else if (errorMsg.includes('from') || errorMsg.includes('Sender') || errorMsg.includes('550')) {
          this.logger.error(
            '💡 HINT: Ensure your SENDGRID_FROM_EMAIL or SMTP_FROM matches the email address verified in SendGrid > Settings > Sender Authentication.',
          );
        }
      }
    }
  }

  async sendInvitationEmail(options: SendInvitationEmailOptions): Promise<boolean> {
    const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:5173');
    const acceptUrl = `${clientUrl}/invite/accept?token=${options.token}`;

    const sendgridFrom = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    const smtpFrom = this.configService.get<string>('SMTP_FROM');
    const smtpUser = this.configService.get<string>('SMTP_USER');

    let defaultFrom = '"Sprintly Team" <noreply@sprintly.com>';
    if (sendgridFrom) {
      defaultFrom = sendgridFrom.includes('<') ? sendgridFrom : `"Sprintly Team" <${sendgridFrom}>`;
    } else if (smtpFrom) {
      defaultFrom = smtpFrom;
    } else if (smtpUser) {
      defaultFrom = `"Sprintly Team" <${smtpUser}>`;
    }

    const from = defaultFrom;

    const targetDescription = `organization <strong>${options.orgName}</strong>`;

    const subject = `You've been invited to join ${options.orgName} on Sprintly`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #172b4d; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .logo { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: inline-block; }
            h2 { margin-top: 0; color: #0f172a; font-size: 22px; font-weight: 600; }
            p { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px; }
            .btn-container { margin: 28px 0; text-align: center; }
            .btn { background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; }
            .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-t: 1px solid #f1f5f9; padding-top: 16px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡ Sprintly</div>
            <h2>You've been invited!</h2>
            <p><strong>${options.inviterName}</strong> has invited you to join ${targetDescription} as a <strong>${options.roleName}</strong>.</p>
            <p>Click the button below to accept your invitation and get started with your team:</p>
            <div class="btn-container">
              <a href="${acceptUrl}" class="btn" target="_blank">Accept Invitation</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:<br><a href="${acceptUrl}" style="color: #2563eb;">${acceptUrl}</a></p>
            <div class="footer">
              If you did not expect this invitation, you can safely ignore this email.
            </div>
          </div>
        </body>
      </html>
    `;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: options.to,
          subject,
          html,
        });
        this.logger.log({ to: options.to, messageId: info.messageId }, 'Invitation email successfully delivered via SMTP');
        return true;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          { to: options.to, err: errorMsg },
          'Failed to send email via SMTP transporter',
        );
        return false;
      }
    } else {
      this.logger.log(
        {
          to: options.to,
          acceptUrl,
          subject,
        },
        '[DEV CONSOLE LOG] Nodemailer invitation email link generated',
      );
      return true;
    }
  }
}
