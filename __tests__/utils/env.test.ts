import {getEnv} from '../../src/utils/env.utils';

describe('.env Utils', () => {
    describe('getEnv', () => {
        const OLD_ENV = process.env;

        beforeEach(() => {
            process.env = {...OLD_ENV}; // avoid contaminating other tests
        });
        afterEach(() => {
            process.env = OLD_ENV; // restores the original env
        });

        test('should return the value when the environment variable exists', () => {
            process.env.TEST_KEY = 'test_value';

            const result = getEnv('TEST_KEY');

            expect(result).toBe('test_value');
        });

        test('should throw an error when the environment variable is missing', () => {
            delete process.env.MISSING_KEY;

            expect(() => getEnv('MISSING_KEY')).toThrow(
                'Missing environment variable: MISSING_KEY'
            );
        });
    });
});
