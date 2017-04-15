import React, {PureComponent} from 'react';
import ConversationList from './ConversationList';
import {Link} from 'react-router';
import {Button} from 'semantic-ui-react';

class HomePage extends PureComponent {
  render() {
    return <div>
        <ConversationList />
        <Link to="/conversation/new" className="new-button"><Button icon="plus" /></Link>
    </div>;
  }
}

export default HomePage;
