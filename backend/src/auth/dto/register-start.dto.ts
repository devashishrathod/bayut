import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterStartDto {
  @IsString()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least 1 letter and 1 number',
  })
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsString()
  @MinLength(9)
  @MaxLength(16)
  @Matches(/^\+?[0-9]{9,15}$/, {
    message:
      'Mobile number must be 9-15 digits (optionally starting with +country code)',
  })
  phone!: string;
}
