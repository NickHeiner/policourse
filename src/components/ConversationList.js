import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';

@firebaseConnect(['/conversations'])
@connect(
  ({firebase}) => ({conversations: firebase.getIn(['data', 'conversations'])})
)
class ConversationList extends PureComponent {
  render() {
    const {conversations} = this.props;
    if (!conversations || !conversations.size) {
      return <p>There are no conversations.</p>;
    }
    return <ul>
      {conversations.map((conversation, index) => <li key={index}>{conversation.get('hostId')}</li>)}
    </ul>;
  }
}

export default ConversationList;
