const expect = require('expect');

let { isRealString } = require('./validation');

describe('isRealString', () => {

    it('should reject non-string value', () => {
        let output = isRealString(28);
        expect(output).toBe(false);
    });

    it('should reject string with only spaces', () => {
        let output = isRealString('   ');
        expect(output).toBe(false);
    });

    it('should allow string with non-space characters', () => {
        let output = isRealString('t');
        expect(output).toBe(true);
    });

});