import React, {PureComponent} from 'react';
import autobind from 'autobind-decorator';
import {Field, reduxForm, formValueSelector} from 'redux-form/immutable';
import {toJS, getUrlRegex} from '../utils';
import {Map} from 'immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {memoize as _memoize} from 'lodash';
import ReactionButton from './ReactionButton';
import {Link} from 'react-router';
import moment from 'moment';

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

function getActivityEventList(records = Map(), typeName) {
  return records.map((record, key) => record.set('key', key).set('type', typeName));
}

function getParticipants(joinRecords, leaveRecords) {
  return getActivityEventList(joinRecords, 'join')
    .merge(getActivityEventList(leaveRecords, 'leave'))
    .toList()
    .sortBy(record => record.get('key'))
    .groupBy(record => record.get('userId'))
    .map(recordsForUser => recordsForUser.last().get('type'))
    .filter(type => type === 'join')
    .keySeq();
}

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
    const {users, currentUser} = this.props;
    const participants = getParticipants(conversation.get('joinRecords'), conversation.get('leaveRecords'));
    const currentUserIsParticipant = Boolean(participants.find(uid => uid === currentUser.uid));

    const joinConversation = () => {
      // If a user leaves, are they allowed to rejoin? If they rejoin, should we wipe out the record of them leaving?
      this.props.firebase.ref(`/conversations/${this.props.params.id}/joinRecords`).push({
        userId: currentUser.uid,
        createdAt: this.props.firebase.database.ServerValue.TIMESTAMP
      });
    };

    const activityEvents = getActivityEventList(conversation.get('joinRecords'), 'join')
      .merge(getActivityEventList(conversation.get('leaveRecords'), 'leave'))
      .merge(getActivityEventList(conversation.get('replies'), 'reply'))
      .toList()
      .sortBy(activityEvent => activityEvent.get('key'));

    const renderEvent = activityEvent => {
      switch (activityEvent.get('type')) {
      case 'reply':
        return <Reply 
          currentUser={currentUser} 
          users={users} 
          conversationId={this.props.params.id} 
          reply={activityEvent} />;
      case 'leave': 
        return <LeaveNotice users={users} leaveRecord={activityEvent} />;
      case 'join': 
        return <JoinNotice users={users} joinRecord={activityEvent} />;
      default:
        throw new Error(`Unrecognized activity event type: ${activityEvent.get('type')}`);
      }
    };

    return <div>
      <p>Started <ShowDate timestampMs={conversation.get('createdAt')} /></p>

      {activityEvents && 
          <ul>
          {activityEvents.map(activityEvent => 
            <li key={activityEvent.get('key')}>
              {renderEvent(activityEvent)}
            </li>
          )
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
      createdAt: this.props.firebase.database.ServerValue.TIMESTAMP,
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

function JoinNotice({users, joinRecord}) {
  if (!users) {
    return null;
  }
  const userWhoLeft = users.get(joinRecord.get('userId'));
  return <div>
      <UserAvatar user={userWhoLeft} /> joined <ShowDate timestampMs={joinRecord.get('createdAt')} />.
    </div>;
}

function LeaveNotice({users, leaveRecord}) {
  if (!users) {
    return null;
  }
  const userWhoLeft = users.get(leaveRecord.get('userId'));
  return <div>
      <UserAvatar user={userWhoLeft} /> left
      {' '} 
      <ShowDate timestampMs={leaveRecord.get('createdAt')} /> because {leaveRecord.get('reason')}.
    </div>;
}

function Reply({currentUser, conversationId, reply, users}) {
  function getReactionButton(reply, replyId, reactionId, label) {
    return <ReactionButton 
      currentUserId={currentUser.uid}
      conversationId={conversationId}
      reactingToName="replies"
      reactingToEntity={reply}
      reactingToEntityId={replyId}
      reactionId={reactionId}
      label={label}
    />;
  }

  const replyId = reply.get('key');
  return <div>
    {users && 
        <UserAvatar user={users.get(reply.get('authorId'))} />
      }
      {reply.get('content')}
      Written <ShowDate timestampMs={reply.get('createdAt')} />
      {getReactionButton(reply, replyId, 'goodPoint', 'Good Point')}
      {getReactionButton(reply, replyId, 'uncivil', 'Uncivil')}
      {getReactionButton(reply, replyId, 'sourceRequested', 'Source Requested')}
  </div>;  
}

@connect(
  state => ({
    sources: getUrlsOfString(formValueSelector('reply')(state, 'content')),
    replyForm: state.ui.getIn(['viewConversation', 'replyForm'])
  })
)
@reduxForm({form: 'reply'})
class ReplyForm extends PureComponent {
  render() {
    const getTextarea = ref => {
      if (ref) {
        this.textarea = ref.getRenderedComponent();
      } else {
        this.textarea = null;
      }
    };

    const START_CITE_CHAR = '[';
    const handleKeyDown = event => {
      if (event.key === START_CITE_CHAR) {
        this.props.dispatch({
          type: 'START_TYPING_CITE'
        });
      } else {
        this.props.dispatch({
          type: 'STOP_TYPING_CITE'
        });
      }
    };

    const handleOnBlur = () => {
      this.props.dispatch({type: 'STOP_TYPING_CITE'});
    };

    return <form onSubmit={this.props.handleSubmit}>
      {this.props.replyForm && this.props.replyForm.get('showCiteSuggestions') && <p>cite suggestions</p>}

      <UserAvatar user={this.props.currentUser} />
      <label htmlFor="content">{this.props.conversation.get('topic')}</label>
      <Field name="content" component="textarea" withRef ref={getTextarea} 
        onKeyDown={handleKeyDown} onBlur={handleOnBlur} />
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

function ShowDate({timestampMs}) {
  return <span>{moment(timestampMs).fromNow()}</span>;
}

export default ViewConversationDialogue;
