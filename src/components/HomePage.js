import React, {PureComponent} from 'react';
import ConversationList from './ConversationList';
import {Link} from 'react-router';

class HomePage extends PureComponent {
  render() {
    return <div>
        <ConversationList />
        <Link to="/conversation/new"><button>+</button></Link>
    </div>;
  }
}

export default HomePage;
