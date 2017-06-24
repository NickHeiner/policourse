import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import ReactionButton from './ReactionButton';
import {Header, Card} from 'semantic-ui-react';

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

    function getReactionButton(source, sourceId, reactionId, label, negativeOrPositive) {
      const mood = {[negativeOrPositive]: true};
      return <ReactionButton 
        currentUserId={currentUser.uid}
        conversationId={params.id}
        reactingToName="sources"
        reactingToEntity={source}
        reactingToEntityId={sourceId}
        reactionId={reactionId}
        label={label}
        {...mood}
      />;
    }

    if (!sources || !sources.size) {
      body = <p>No sources have been added to this conversation yet.</p>;
    } else {
      body = <Card.Group>
        {
          sources.map((source, key) => 
            <Card key={key} style={{width: 'inherit'}}>
              <Card.Content>
                <Card.Header>
                  <a href={source.get('href')}>{source.get('href')}</a>
                </Card.Header>
              </Card.Content>
              <Card.Content>
                {getReactionButton(source, key, 'goodSource', 'Trustworthy', 'positive')}
                {getReactionButton(source, key, 'badSource', 'Questionable', 'negative')}
              </Card.Content>
            </Card>
          )
          .toList()
          .toJS()
        }
      </Card.Group>;
    }

    return <div>
      <Header>Sources</Header>
      {body}
    </div>;
  }
}

export default ViewConversationSources;
