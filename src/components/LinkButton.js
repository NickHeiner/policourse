import React from 'react';
import {browserHistory} from 'react-router';
import {Button} from 'semantic-ui-react';

export default function LinkButton({to, ...props}) {
  return <Button onClick={() => browserHistory.push(to)} {...props} role="link" />;
}