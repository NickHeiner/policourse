import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';

@firebaseConnect(['/conversations'])
@connect(
  ({firebase}) => ({conversations: firebase.get('conversations')})
)
class ConversationList extends PureComponent {
  render() {
    const {conversations} = this.props;
    if (!conversations || !conversations.size) {
      return <p>There are no conversations.</p>;
    }
  }
}

export default ConversationList;
