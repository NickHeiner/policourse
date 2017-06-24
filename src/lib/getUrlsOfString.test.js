import getUrlsOfString from './getUrlsOfString';

test('Empty string', () => {
  expect(getUrlsOfString('')).toEqual([]);
});

test('String with non-url content', () => {
  expect(getUrlsOfString('1600 Pennsylvania Ave NW Washington DC 22202')).toEqual([]);
});

test('URL with other content', () => {
  expect(getUrlsOfString('Check this out: https://www.nytimes.com/2017/05/09/us/politics/james-comey-fired-fbi.html'))
    .toEqual([{
      index: 16,
      match: 'https://www.nytimes.com/2017/05/09/us/politics/james-comey-fired-fbi.html'
    }]);
});

test('FTP URL', () => {
  expect(getUrlsOfString('ftp://upload.com')).toEqual([]);
});

test('http URL', () => {
  expect(getUrlsOfString('http://my.news.com')).toEqual([{
    index: 0,
    match: 'http://my.news.com'
  }]);
});

describe('incomplete URL', () => {
  test('no subdomain', () => {
    expect(getUrlsOfString('http://')).toEqual([]);
  });

  test('no hostname', () => {
    expect(getUrlsOfString('http://wwww')).toEqual([]);
  });

  test('no top-level domain', () => {
    expect(getUrlsOfString('http://www.google')).toEqual([]);
  });
})

