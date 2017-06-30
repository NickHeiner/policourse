import {memoize as _memoize} from 'lodash';

const urlRegex = /(https?:)\/\/(([^/?#. ]+)\.)?([^?#. ]+)\.([^?# ]+)(\?([^#]. ))?(#([^ ]*))?/ig;

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
