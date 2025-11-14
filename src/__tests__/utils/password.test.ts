import * as pwd from "../../utils/password.utils";
import bcrypt from "bcrypt";

describe('password Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe('check', () => {
        test('should detect a too short password', () => {
            const result = pwd.check('pass');

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long');
        });
        test('should detect missing uppercase', () => {
            const result = pwd.check('password');

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
        });
        test('should detect missing lowercase', () => {
            const result = pwd.check('PASSWORD');

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
        });
        test('should detect missing number', () => {
            const result = pwd.check('password');

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
        });
        test('should detect missing special character', () => {
            const result = pwd.check('password');

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character');
        });

        test('should detect multiple errors for a weak password', () => {
            const result = pwd.check('abc');

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long');
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
            expect(result.errors).toContain('Password must contain at least one number');
            expect(result.errors).toContain('Password must contain at least one special character');
        });

        test('should return valid=true for a strong password', () => {
            const result = pwd.check('StrongP@ssw0rd!');

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('checkOrThrow', () => {
        test('should throw PasswordError for invalid password', () => {
            expect(() => pwd.checkOrThrow('invalid')).toThrow(pwd.PasswordError);
        });
        test('should include the correct errors in PasswordError', () => {
            try {
                pwd.checkOrThrow('invalid');
            } catch (err: any) {
                expect(err).toBeInstanceOf(pwd.PasswordError);
                expect(err.errors).toContain('Password must be at least 8 characters long');
                expect(err.errors).toContain('Password must contain at least one uppercase letter');
                expect(err.errors).toContain('Password must contain at least one number');
                expect(err.errors).toContain('Password must contain at least one special character');
            }
        });

        test('should NOT throw for a valid password', () => {
            expect(() => pwd.checkOrThrow('Val1dP@ssw0rd')).not.toThrow();
        });
    });

    describe('hash', () => {
        test('should call checkOrThrow before hashing', () => {
            const password = 'Val1dP@ssw0rd'

            jest.spyOn(pwd, 'check');
            jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedPassword123');

            const result = pwd.hash(password);

            expect(pwd.check).toHaveBeenCalledWith(password);
            expect(bcrypt.hashSync).toHaveBeenCalledWith(password, pwd.BCRYPT_ROUNDS);
            expect(result).toBe('hashedPassword123');
        });

        test('should throw PasswordError if password is invalid', () => {
            expect(() => pwd.hash('weak')).toThrow(pwd.PasswordError);
        });

        test('should correctly encrypt the password', () => {
            const password = 'Val1dP@ssw0rd'
            const hash = pwd.hash(password);

            expect(bcrypt.compareSync(password, hash)).toBe(true);
        });
    });

    describe("compare", () => {
        test('should call bcrypt.compareSync with password and hash', () => {
            jest.spyOn(bcrypt, 'compareSync');

            pwd.compare('myPassword!', 'encryptedHash');

            expect(bcrypt.compareSync).toHaveBeenCalledWith('myPassword!', 'encryptedHash');
        });
    });
});
