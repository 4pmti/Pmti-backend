import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';


export class BcryptService {
    private readonly saltRounds: number;
    constructor(private configService: ConfigService) {
         try {
           this.saltRounds = this.configService.get<number>('SALT_ROUNDS', 10);
         } catch (error) {
            this.saltRounds = 8;
         }
    }

    /**
     * Hashes a password using bcrypt
     * @param password - The plain text password to hash
     * @returns Promise<string> - The hashed password
     */
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return bcrypt.hash(password, salt);
    }

    /**
     * Compares a plain text password with a hashed password
     * @param password - The plain text password to check
     * @param hashedPassword - The hashed password to compare against
     * @returns Promise<boolean> - True if passwords match, false otherwise
     */
    async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}