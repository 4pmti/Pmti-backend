import {
    IsString,
    IsEmail,
    Length,
    IsOptional,
    IsBoolean
} from 'class-validator';

export class CreateInstructorDto {
    @IsString()
    @Length(1, 255)
    name: string;

    @IsEmail()
    @Length(1, 255)
    emailID: string;

    @IsString()
    @Length(10, 15)
    mobile: string;

    @IsOptional()
    @IsString()
    @Length(1, 20)
    telNo?: string;


    @IsString()
    @Length(8, 255)
    password: string;

    @IsOptional()
    @IsString()
    @Length(1, 255)
    billingAddress?: string;

    @IsOptional()
    @IsString()
    @Length(1, 255)
    contactAddress?: string;

    @IsOptional()
    @IsString()
    profile?: string;

    @IsOptional()
    @IsBoolean()
    isDelete?: boolean;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsOptional()
    @IsString()
    addedById?: string;

    @IsOptional()
    @IsString()
    updatedById?: string;
}
