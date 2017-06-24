import {memoize as _memoize} from 'lodash';

// Adapted from ftp://gist.github.com/hansifer/32bcba48c24621c2da78
// Adapted from https://gist.github.com/hansifer/32bcba48c24621c2da78
// This should be further adapted to match what we are looking for.
// eslint-disable-next-line no-useless-escape,max-len
const urlRegex = /(https?:)\/\/([^\/?#]+)([^?#]*)(\?([^#]*))?(#(.*))?/ig;

export default _memoize(str => {
  if (!str) {
    return [];
  }

  let mostRecentMatch;
  const matches = [];
  // eslint-disable-next-line no-cond-assign
  while ((mostRecentMatch = urlRegex.exec(str)) !== null) {
    matches.push({
      index: mostRecentMatch.index,
      match: mostRecentMatch[0]
    });
  }
  return matches;
});
