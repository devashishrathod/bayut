import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterVerifyDto {
  @IsString()
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d{4,6}$/, { message: 'OTP must be 4-6 digits' })
  otp!: string;
}
