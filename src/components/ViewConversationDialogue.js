import React, {PureComponent} from 'react';
import autobind from 'autobind-decorator';
import {Field, reduxForm, formValueSelector} from 'redux-form';
import {toJS, getUrlRegex} from '../utils';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {memoize as _memoize} from 'lodash';
import ReactionButton from './ReactionButton';
import {Link} from 'react-router';

const getUrlsOfString = _memoize(str => {
  if (!str) {
    return [];
  }

  let mostRecentMatch;
  const matches = [];
  const urlRegex = getUrlRegex();
  // eslint-disable-next-line no-cond-assign
  while ((mostRecentMatch = urlRegex.exec(str)) !== null) {
    matches.push({
      index: mostRecentMatch.index,
      match: mostRecentMatch[0]
    });
  }
  return matches;
});

@firebaseConnect(['/conversations', '/users'])
@connect(
  ({firebase}) => ({
    users: firebase.getIn(['data', 'users']),
    conversations: firebase.getIn(['data', 'conversations']),
    currentUser: firebase.get('auth')
  })
)
class ViewConversationDialogue extends PureComponent {
  render() {
    const conversation = this.props.conversations.get(this.props.params.id);
    const {users, currentUser, params} = this.props;
    const replies = conversation.get('replies');
    const participants = conversation.get('participants');
    const currentUserIsParticipant = participants && Boolean(participants.find(uid => uid === currentUser.uid));

    function getReactionButton(reply, replyId, reactionId, label) {
      return <ReactionButton 
        currentUserId={currentUser.uid}
        conversationId={params.id}
        reactingToName="replies"
        reactingToEntity={reply}
        reactingToEntityId={replyId}
        reactionId={reactionId}
        label={label}
      />;
    }

    const joinConversation = () => {
      // If a user leaves, are they allowed to rejoin? If they rejoin, should we wipe out the record of them leaving?
      this.props.firebase.ref(`/conversations/${this.props.params.id}/participants`).push(currentUser.uid);
    };

    return <div>
      {replies && 
          <ul>
          {replies.map((reply, replyId) => <li key={replyId}>
              {users && 
                <UserAvatar user={users.get(reply.get('authorId'))} />
              }
              {reply.get('content')}
              {getReactionButton(reply, replyId, 'goodPoint', 'Good Point')}
              {getReactionButton(reply, replyId, 'uncivil', 'Uncivil')}
              {getReactionButton(reply, replyId, 'sourceRequested', 'Source Requested')}
            </li>)
            .toList()
            .toJS()}
          </ul>
        }

        {currentUserIsParticipant &&  
          <ReplyForm currentUser={currentUser} conversation={conversation} onSubmit={this.addReply} />
        }
        {users && participants &&
          <div>
            <h4>Participants</h4>
            <ul>
              {
                participants
                  .map(participantId => 
                    <li key={participantId}><UserAvatar user={users.get(participantId)} /></li>)
                  .toList()
                  .toJS()
              }
            </ul>
          </div>
        }
        
        {currentUserIsParticipant 
          ? <Link to={`/conversation/${this.props.params.id}/leave`}>
            <button>Leave conversation</button>
          </Link> 
          : <button onClick={joinConversation}>Join conversation to share your thoughts</button>
        }
    </div>;
  }

  @autobind
  async addReply(replyFormData) {
    const pushedReply = await this.props.firebase.push(`/conversations/${this.props.params.id}/replies`, {
      ...replyFormData,
      authorId: this.props.currentUser.uid
    });

    getUrlsOfString(replyFormData.content).map(source => 
      this.props.firebase.push(`/conversations/${this.props.params.id}/sources`, {
        fromReply: pushedReply.key,
        href: source.match,
        indexInReply: source.index
      })
    );
  }
}

@connect(
  state => ({sources: getUrlsOfString(formValueSelector('reply')(state, 'content'))})
)
@reduxForm({form: 'reply'})
class ReplyForm extends PureComponent {
  render() {
    return <form onSubmit={this.props.handleSubmit}>
      <UserAvatar user={this.props.currentUser} />
      <label htmlFor="content">{this.props.conversation.get('topic')}</label>
      <Field name="content" component="textarea" />
      <button type="submit" disabled={this.props.pristine}>Reply</button>

      <h5>Sources</h5>
      <ul>
        {
          this.props.sources.map(({match}, index) => 
            <li key={index}><a href={match}>{match}</a></li>
          )
        }
      </ul>
    </form>;
  }
}

@toJS
class UserAvatar extends PureComponent {
  render() {
    const {user} = this.props;
    return <div>
      <img src={user.avatarUrl || user.photoURL} 
        alt={`Avatar for ${user.displayName}`} 
        style={{width: '100px', height: '100px', borderRadius: '100%'}} />
      <span>{user.displayName}</span>
    </div>;
  }
}

export default ViewConversationDialogue;
