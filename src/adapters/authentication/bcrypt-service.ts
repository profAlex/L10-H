import "reflect-metadata";
import { injectable } from "inversify";
import bcrypt from "bcrypt";

@injectable()
export class BcryptService {
    async generateHash(password: string): Promise<string | null> {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            return hash;
        } catch (error) {
            console.error("Error while generating hash:", error);
            return null;
        }
    }

    async checkPassword(
        password: string,
        hash: string,
    ): Promise<boolean | null> {
        try {
            const result = await bcrypt.compare(password, hash);
            return result;
        } catch (error) {
            console.error("Error while checking password:", error);
            return null;
        }
    }
};
