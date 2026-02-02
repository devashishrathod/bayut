import { IsEmail, IsString, MaxLength } from 'class-validator';

export class ResendOtpDto {
  @IsString()
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
