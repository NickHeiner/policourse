import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Item, Icon, Divider} from 'semantic-ui-react';
import './ConversationList.css';

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
    
    const conversationList = conversations
        .map((conversation, id) => conversation.set('id', id))
        .toList();

    return <ul className="conversation-list">
      {conversationList
        .map((conversation, index) => 
          <li key={conversation.get('id')}>
            <div>
              <ConversationListItem conversation={conversation} />
              {index !== conversationList.size - 1 && <Divider />}
            </div>
          </li>
        )
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
    return <Item className="conversation-list-item">
      <Item.Content>
        <Link to={`/conversation/${conversation.get('id')}`}>
          <Item.Header as="h3"><Icon name="comments" />{conversation.get('topic')}</Item.Header>
          {hostName && <Item.Description>Started by {hostName}.</Item.Description>}
        </Link>
      </Item.Content>
    </Item>;
  }
}

export default ConversationList;
