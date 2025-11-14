import bcrypt from "bcrypt";

export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export const hash = (password: string) => {
    checkOrThrow(password);
    return bcrypt.hashSync(password, BCRYPT_ROUNDS);
};

export const compare = (password: string, encrypted: string) => bcrypt.compareSync(password, encrypted);

export const check = (password: string): { valid: boolean, errors: string[] } => {
    const errors: string[] = [];

    // separation of the following conditions in order to simplify modifications
    if (password.length < 8)
        errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password))
        errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password))
        errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password))
        errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        errors.push('Password must contain at least one special character');

    return {
        valid: errors.length === 0,
        errors,
    };
};

export const checkOrThrow = (password: string) => {
    const {valid, errors} = check(password);
    if (!valid) throw new PasswordError(errors);
};

export class PasswordError extends Error {
    public readonly errors: string[];

    constructor(errors: string[]) {
        super('Password validation failed');
        this.name = 'PasswordError';
        this.errors = errors;

        Object.setPrototypeOf(this, PasswordError.prototype);
    }
}
