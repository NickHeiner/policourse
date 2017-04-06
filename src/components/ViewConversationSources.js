import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import ReactionButton from './ReactionButton';

@firebaseConnect(['/conversations'])
@connect(
  ({firebase}) => ({
    conversations: firebase.getIn(['data', 'conversations']),
    currentUser: firebase.get('auth')
  })
)
class ViewConversationSources extends PureComponent {
  render() {
    const {currentUser, conversations, params} = this.props;
    const sources = conversations.getIn([this.props.params.id, 'sources']);
    let body;

    function getReactionButton(source, sourceId, reactionId, label) {
      return <ReactionButton 
        currentUserId={currentUser.uid}
        conversationId={params.id}
        reactingToName="sources"
        reactingToEntity={source}
        reactingToEntityId={sourceId}
        reactionId={reactionId}
        label={label}
      />;
    }

    if (!sources || !sources.size) {
      body = <p>No sources have been added to this conversation yet.</p>;
    } else {
      body = <ul>
        {
          sources.map((source, key) => 
            <li key={key}>
              <a href={source.get('href')}>{source.get('href')}</a>
              {getReactionButton(source, key, 'goodSource', 'Good Source')}
              {getReactionButton(source, key, 'badSource', 'Questionable Source')}
            </li>
          )
          .toList()
          .toJS()
        }
      </ul>;
    }

    return <div>
      <h3>Sources</h3>
      {body}
    </div>;
  }
}

export default ViewConversationSources;
