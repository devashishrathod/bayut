import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, randomBytes } from 'crypto';
import { MailerService } from './mailer.service';
import { RegisterStartDto } from './dto/register-start.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
  ) {}

  private otpSecret() {
    return (
      process.env.OTP_SECRET ??
      process.env.JWT_ACCESS_TOKEN_SECRET ??
      'change-me'
    );
  }

  private hashOtp(otp: string) {
    return createHash('sha256')
      .update(`${otp}.${this.otpSecret()}`)
      .digest('hex');
  }

  private generateOtp() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  private otpEmailHtml(otp: string) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:18px;padding:28px;border:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:999px;background:#059669;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">b</div>
          <div style="font-size:18px;font-weight:700;color:#059669;">bayut</div>
        </div>
        <h2 style="margin:18px 0 0 0;font-size:18px;">Hello,</h2>
        <p style="margin:10px 0 0 0;font-size:14px;line-height:20px;color:#374151;">
          A request has been received to access your Bayut account. Please enter the following code to proceed:
        </p>
        <div style="margin:18px 0 0 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center;">
          <div style="letter-spacing:10px;font-size:28px;font-weight:800;color:#111827;">${otp.split('').join(' ')}</div>
        </div>
        <p style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">This code is valid for 5 minutes.</p>
        <p style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">If you did not initiate this request, please ignore this message.</p>
        <p style="margin:18px 0 0 0;font-size:12px;color:#6b7280;">Thanks,<br/>Bayut Team</p>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:11px;color:#9ca3af;">
        Please do not reply to this email. Replies are routed to an unmonitored mailbox.
      </div>
    </div>
  </body>
</html>`;
  }

  private resetPasswordEmailHtml(resetUrl: string) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:18px;padding:28px;border:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:999px;background:#059669;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">b</div>
          <div style="font-size:18px;font-weight:700;color:#059669;">bayut</div>
        </div>
        <h2 style="margin:18px 0 0 0;font-size:18px;">Reset your password</h2>
        <p style="margin:10px 0 0 0;font-size:14px;line-height:20px;color:#374151;">
          We received a request to reset your Bayut password.
        </p>
        <div style="margin:18px 0 0 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 16px;font-size:14px;">Reset password</a>
        </div>
        <p style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">
          This link is valid for 30 minutes.
        </p>
        <p style="margin:14px 0 0 0;font-size:12px;color:#6b7280;">
          If you did not request a password reset, you can ignore this email.
        </p>
        <p style="margin:18px 0 0 0;font-size:12px;color:#6b7280;">Thanks,<br/>Bayut Team</p>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:11px;color:#9ca3af;">
        Please do not reply to this email. Replies are routed to an unmonitored mailbox.
      </div>
    </div>
  </body>
</html>`;
  }

  private hashResetToken(token: string) {
    return createHash('sha256')
      .update(`${token}.${this.otpSecret()}`)
      .digest('hex');
  }

  private verifiedEmailHtml() {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:18px;padding:28px;border:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:999px;background:#059669;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">b</div>
          <div style="font-size:18px;font-weight:700;color:#059669;">bayut</div>
        </div>
        <h2 style="margin:18px 0 0 0;font-size:18px;">Verified successfully</h2>
        <p style="margin:10px 0 0 0;font-size:14px;line-height:20px;color:#374151;">
          Your email has been verified successfully. You can now continue browsing properties.
        </p>
        <div style="margin:18px 0 0 0;border-radius:14px;padding:14px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:13px;">
          You're all set.
        </div>
        <p style="margin:18px 0 0 0;font-size:12px;color:#6b7280;">Thanks,<br/>Bayut Team</p>
      </div>
    </div>
  </body>
</html>`;
  }

  async register(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const accessToken = await this.signAccessToken(user.id, user.email);

    return { user, accessToken };
  }

  async registerStart(dto: RegisterStartDto) {
    const email = dto.email.toLowerCase().trim();
    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing?.isEmailVerified) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = existing
      ? await this.prisma.user.update({
          where: { email },
          data: {
            passwordHash,
            name: dto.name,
            phone: dto.phone,
            emailOtpHash: otpHash,
            emailOtpExpiresAt: expiresAt,
            emailOtpAttempts: 0,
          },
          select: { id: true, email: true, name: true, phone: true },
        })
      : await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            name: dto.name,
            phone: dto.phone,
            isEmailVerified: false,
            emailOtpHash: otpHash,
            emailOtpExpiresAt: expiresAt,
            emailOtpAttempts: 0,
          },
          select: { id: true, email: true, name: true, phone: true },
        });

    await this.mailer.sendHtml(
      email,
      'Your Bayut verification code',
      this.otpEmailHtml(otp),
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      otpSent: true,
    };
  }

  async resendOtp(emailInput: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    if (user.isEmailVerified) {
      return { otpSent: false, message: 'Email already verified' };
    }

    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: {
        emailOtpHash: otpHash,
        emailOtpExpiresAt: expiresAt,
        emailOtpAttempts: 0,
      },
    });

    await this.mailer.sendHtml(
      email,
      'Your Bayut verification code',
      this.otpEmailHtml(otp),
    );

    return { otpSent: true };
  }

  async registerVerify(emailInput: string, otpInput: string) {
    const email = emailInput.toLowerCase().trim();
    const otp = otpInput.trim();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    if (user.isEmailVerified) {
      const accessToken = await this.signAccessToken(user.id, user.email);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        accessToken,
        verified: true,
      };
    }

    if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
      throw new BadRequestException('OTP not requested');
    }
    if (user.emailOtpAttempts >= 5) {
      throw new BadRequestException('Too many attempts. Please resend OTP.');
    }
    if (user.emailOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired. Please resend OTP.');
    }

    const expected = user.emailOtpHash;
    const actual = this.hashOtp(otp);
    if (expected !== actual) {
      await this.prisma.user.update({
        where: { email },
        data: { emailOtpAttempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }

    const updated = await this.prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailOtpHash: null,
        emailOtpExpiresAt: null,
        emailOtpAttempts: 0,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    await this.mailer.sendHtml(
      email,
      'Your email has been verified',
      this.verifiedEmailHtml(),
    );

    const accessToken = await this.signAccessToken(updated.id, updated.email);
    return { user: updated, accessToken, verified: true };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.signAccessToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('No account found for this email');
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    const frontendOrigin =
      process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
    const resetUrl = `${frontendOrigin}/reset-password?email=${encodeURIComponent(
      email,
    )}&token=${encodeURIComponent(token)}`;

    await this.mailer.sendHtml(
      email,
      'Reset your Bayut password',
      this.resetPasswordEmailHtml(resetUrl),
    );

    return { requested: true };
  }

  async resetPassword(emailInput: string, token: string, newPassword: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid reset link');
    }

    if (!user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
      throw new BadRequestException(
        'Reset link expired. Please request again.',
      );
    }
    if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'Reset link expired. Please request again.',
      );
    }

    const expected = user.resetPasswordTokenHash;
    const actual = this.hashResetToken(token.trim());
    if (expected !== actual) {
      throw new BadRequestException('Invalid reset link');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    });

    return { reset: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  private async signAccessToken(userId: string, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }
}
