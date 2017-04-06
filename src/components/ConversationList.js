import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {Link} from 'react-router';

@firebaseConnect(['/conversations'])
@connect(
  ({firebase}) => ({
    conversations: firebase.getIn(['data', 'conversations']),
    requestedConversations: firebase.getIn(['requested', 'conversations'])
  })
)
class ConversationList extends PureComponent {
  render() {
    if (!this.props.requestedConversations) {
      return null;
    }

    const {conversations} = this.props;
    if (!conversations || !conversations.size) {
      return <p>There are no conversations.</p>;
    }

    return <ul>
      {conversations
        .map((conversation, id) => 
          <li key={id}><ConversationListItem conversation={conversation.set('id', id)} /></li>)
        .toList()
        .toJS()
      }
    </ul>;
  }
}

@firebaseConnect(['/users'])
@connect(
  ({firebase}) => ({users: firebase.getIn(['data', 'users'])})
)
class ConversationListItem extends PureComponent {
  render() {
    const {conversation, users} = this.props;
    const hostName = users ? users.get(conversation.get('hostId')).get('displayName') : null;
    return <Link to={`/conversation/${conversation.get('id')}`} style={{border: '1px solid black'}}>
      <h3>{conversation.get('topic')}</h3>
      {hostName && <p>Started by {hostName}.</p>}
    </Link>;
  }
}

export default ConversationList;
