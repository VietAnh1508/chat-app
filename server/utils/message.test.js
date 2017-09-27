let expect = require('expect');

let { generateMessage, generateLocationMessage } = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', () => {
        let from = 'Admin';
        let text = 'Some message';
        let message = generateMessage(from, text);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({ from, text });
    });
})

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        let from = 'Admin';
        let latitude = 28;
        let longitude = 4;
        let url = 'https://www.google.com/maps?q=28,4';
        let message = generateLocationMessage(from, latitude, longitude);

        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({ from, url });
    });
});