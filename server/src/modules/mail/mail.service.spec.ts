import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let mockTransporter: {
    verify: jest.Mock;
    sendMail: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  const createServiceWithConfig = async (configValues: Record<string, string>) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              return configValues[key] !== undefined ? configValues[key] : defaultValue;
            }),
          },
        },
      ],
    }).compile();

    return module.get<MailService>(MailService);
  };

  it('should initialize Resend SMTP transporter when RESEND_API_KEY is present', async () => {
    service = await createServiceWithConfig({
      RESEND_API_KEY: 're_123456789_test_key',
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: 're_123456789_test_key',
      },
    });
  });

  it('should initialize SendGrid transporter when RESEND_API_KEY is absent and SENDGRID_API_KEY is present', async () => {
    service = await createServiceWithConfig({
      SENDGRID_API_KEY: 'SG.test_key',
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: 'SG.test_key',
      },
    });
  });

  it('should resolve sender address in priority order: RESEND_FROM_EMAIL > SENDGRID_FROM_EMAIL > SMTP_FROM > SMTP_USER', async () => {
    service = await createServiceWithConfig({
      RESEND_API_KEY: 're_123456789',
      RESEND_FROM_EMAIL: 'noreply@resend.dev',
      SENDGRID_FROM_EMAIL: 'noreply@sendgrid.com',
    });

    const result = await service.sendInvitationEmail({
      to: 'user@example.com',
      inviterName: 'John',
      orgName: 'Acme',
      roleName: 'Member',
      token: 'inv-token',
    });

    expect(result).toBe(true);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Sprintly Team" <noreply@resend.dev>',
        to: 'user@example.com',
      }),
    );
  });

  it('should fallback to dev console log when no email credentials are set', async () => {
    service = await createServiceWithConfig({});

    const result = await service.sendInvitationEmail({
      to: 'user@example.com',
      inviterName: 'John',
      orgName: 'Acme',
      roleName: 'Member',
      token: 'inv-token',
    });

    expect(result).toBe(true);
    expect(mockTransporter.sendMail).not.toHaveBeenCalled();
  });
});
