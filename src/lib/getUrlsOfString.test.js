import getUrlsOfString from './getUrlsOfString';

test('Empty string', () => {
  expect(getUrlsOfString('')).toEqual([]);
});

test('String with non-url content', () => {
  expect(getUrlsOfString('1600 Pennsylvania Ave NW Washington DC 22202')).toEqual([]);
});

test('Link with other content', () => {
  expect(getUrlsOfString('Check this out: https://www.nytimes.com/2017/05/09/us/politics/james-comey-fired-fbi.html'))
    .toEqual([{
      index: 16,
      match: 'https://www.nytimes.com/2017/05/09/us/politics/james-comey-fired-fbi.html'
    }]);
});

test('FTP link', () => {
  expect(getUrlsOfString('ftp://upload.com'))
    .toEqual([]);
});

test('http link', () => {
  expect(getUrlsOfString('http://news.com'))
    .toEqual([{
      index: 0,
      match: 'http://news.com'
    }]);
});
