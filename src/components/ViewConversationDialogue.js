import React, {PureComponent} from 'react';
import autobind from 'autobind-decorator';
import {Field, reduxForm, formValueSelector} from 'redux-form/immutable';
import {toJS} from '../utils';
import getUrlsOfString from '../lib/getUrlsOfString';
import {Map} from 'immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {memoize as _memoize} from 'lodash';
import ReactionButton from './ReactionButton';
import {Link} from 'react-router';
import moment from 'moment';
import textareaCaret from 'textarea-caret';
import _get from 'lodash.get';
import classnames from 'classnames';
import {Header, Divider, Comment, Form, Button, Card, Image} from 'semantic-ui-react';

const getCitesOfString = _memoize(str => {
  if (!str) {
    return [];
  }

  let mostRecentMatch;
  const matches = [];
  const citeRegex = /\[(\d+)\]/g;
  // eslint-disable-next-line no-cond-assign
  while ((mostRecentMatch = citeRegex.exec(str)) !== null) {
    matches.push({
      index: mostRecentMatch.index,
      humanSourceId: mostRecentMatch[1]
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
          key={activityEvent.get('key')}
          currentUser={currentUser} 
          users={users} 
          conversationId={this.props.params.id} 
          reply={activityEvent} />;
      case 'leave': 
        return <LeaveNotice users={users} leaveRecord={activityEvent} key={activityEvent.get('key')} />;
      case 'join': 
        return <JoinNotice users={users} joinRecord={activityEvent} key={activityEvent.get('key')} />;
      default:
        throw new Error(`Unrecognized activity event type: ${activityEvent.get('type')}`);
      }
    };

    return <div>
      <p>Started <ShowDate timestampMs={conversation.get('createdAt')} /></p>

      {activityEvents && 
          <Comment.Group as="ul" className="semantic-list">
          {activityEvents
            .map(renderEvent)
            .toList()
            .toJS()}
          </Comment.Group>
      }

      <Divider />

      {currentUserIsParticipant &&  
        <ReplyForm currentUser={currentUser} conversation={conversation} onSubmit={this.addReply} />
      }
      {users && participants &&
        <div>
          <Divider />
          <Header as="h3" textAlign="center">Participants</Header>
          <ul className="semantic-list">
            {
              participants
                .map(participantId => {
                  const user = users.get(participantId);
                  return <li key={participantId}>
                    {/* Card has a fixed width of 290px, and if our image is smaller, it wil
                        look bad. We'll work around that by manually setting the width.
                    */}
                    <Card raised centered style={{width: '150px'}}>
                      <Image src={user.get('avatarUrl') || user.get('photoURL')} size="small" />
                      <Card.Content>
                        <Card.Header style={{textAlign: 'center'}}>
                          {user.get('displayName')}
                        </Card.Header>
                      </Card.Content>
                    </Card>
                  </li>;
                })
                .toList()
                .toJS()
            }
          </ul>
        </div>
      }
      
      {currentUserIsParticipant 
        ? <Link to={`/conversation/${this.props.params.id}/leave`}>
          <Button content="Leave conversation" icon="sign out" />
        </Link> 
        : <Button onClick={joinConversation} icon="sign in" content="Join conversation to share your thoughts" />
      }
    </div>;
  }

  @autobind
  async addReply(immutableReplyFormData) {
    const replyFormData = immutableReplyFormData.toJS();
    const pushedReply = await this.props.firebase.push(`/conversations/${this.props.params.id}/replies`, {
      ...replyFormData,
      createdAt: this.props.firebase.database.ServerValue.TIMESTAMP,
      authorId: this.props.currentUser.uid
    });

    getCitesOfString(replyFormData.content).forEach(match => {
      const conversation = this.props.conversations.get(this.props.params.id);
      const referencedSourceKey = conversation
        .get('sources')
        .findKey(source => source.get('humanSourceId').toString() === match.humanSourceId);

      this.props.firebase.ref(`/conversations/${this.props.params.id}/sources/${referencedSourceKey}/uses`).push({
        fromReply: pushedReply.key,
        indexInReply: match.index
      });
    });

    getUrlsOfString(replyFormData.content).forEach(async source => {
      const sourcesRef = this.props.firebase.ref(`/conversations/${this.props.params.id}/sources`);
      const pushedSource = await sourcesRef.push({href: source.match});
      pushedSource.child('uses').push({
        fromReply: pushedReply.key,
        indexInReply: source.index
      });

      sourcesRef.transaction(sources => {
        if (sources) {
          pushedSource.child('humanSourceId').set(Object.keys(sources).length);
        }
      });
    });
  }
}

function JoinNotice({users, joinRecord}) {
  if (!users) {
    return null;
  }
  const userWhoLeft = users.get(joinRecord.get('userId'));
  return <Comment as="li">
    <Comment.Avatar src={userWhoLeft.get('avatarUrl') || userWhoLeft.get('photoURL')} />
    <Comment.Content>
      <Comment.Metadata>
        {userWhoLeft.get('displayName')} joined <ShowDate timestampMs={joinRecord.get('createdAt')} />
      </Comment.Metadata>
      {/* Partial workaround for https://github.com/Semantic-Org/Semantic-UI-React/issues/1584 */}
      <Comment.Text />
    </Comment.Content>
    </Comment>;
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
  function getReactionButton(reply, replyId, reactionId, label, icon) {
    return <ReactionButton 
      currentUserId={currentUser.uid}
      conversationId={conversationId}
      reactingToName="replies"
      reactingToEntity={reply}
      reactingToEntityId={replyId}
      reactionId={reactionId}
      label={label}
      icon={icon}
    />;
  }

  const replyId = reply.get('key');
  const commentAuthor = users && users.get(reply.get('authorId'));

  return <Comment as="li">
    {commentAuthor && <Comment.Avatar src={commentAuthor.get('avatarUrl') || commentAuthor.get('photoURL')} />}
    <Comment.Content>
      {commentAuthor && 
        <Comment.Author>
          {commentAuthor.get('displayName')}
        </Comment.Author>
      }
      <Comment.Metadata>
        Written <ShowDate timestampMs={reply.get('createdAt')} />
      </Comment.Metadata>
      <Comment.Text>
        {reply.get('content')}
      </Comment.Text>
      <Comment.Actions>
        {getReactionButton(reply, replyId, 'goodPoint', 'Good Point', 'checkmark')}
        {getReactionButton(reply, replyId, 'uncivil', 'Uncivil', 'warning circle')}
        {getReactionButton(reply, replyId, 'sourceRequested', 'Source Requested', 'book')}
      </Comment.Actions>
    </Comment.Content>
  </Comment>;  
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

    const replyForm = this.props.replyForm || Map();

    const START_CITE_CHAR = '[';
    const handleKeyDown = event => {
      if (replyForm.get('showCiteSuggestions')) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const eventType = event.key === 'ArrowDown' 
            ? 'CITE_SUGGESTION_SELECTED_INCREMENT' : 'CITE_SUGGESTION_SELECTED_DECREMENT';
          this.props.dispatch({
            type: eventType,
            payload: {
              sourceCount: this.props.conversation.get('sources').size
            }
          });
        } else if (event.key === 'Enter') {
          event.preventDefault();
          this.props.dispatch({
            type: 'CHOOSE_CITE',
            payload: {
              humanSourceId: this.props.conversation.get('sources')
                .toList()
                .get(replyForm.get('selectedCiteIndex'))
                .get('humanSourceId')
            }
          });
          this.props.dispatch({
            type: 'STOP_TYPING_CITE'
          });
        } else {
          this.props.dispatch({
            type: 'STOP_TYPING_CITE'
          });
        } 
      } else if (event.key === START_CITE_CHAR) {
        this.props.dispatch({
          type: 'START_TYPING_CITE'
        });
      } 

      if (this.textarea) {
        this.props.dispatch({
          type: 'TEXTAREA_CARET_POSITION_UPDATE',
          payload: textareaCaret(this.textarea, this.textarea.selectionEnd)
        });
      }

    };

    const handleOnBlur = () => {
      this.props.dispatch({type: 'STOP_TYPING_CITE'});
    };

    let absoluteTextAreaCaretPosition;
    if (replyForm.get('showCiteSuggestions')) {
      const relativeTextAreaCaretPosition = replyForm.get('textAreaCaretPosition');
      if (relativeTextAreaCaretPosition && this.textarea) {
        const textareaRect = {top: this.textarea.offsetTop, left: this.textarea.offsetLeft};
        const suggesterOffset = {top: 15, left: 4};
        const scrollAdjustment = {top: -(this.textarea.scrollHeight - this.textarea.offsetHeight), left: 0};
        absoluteTextAreaCaretPosition = [
          scrollAdjustment, suggesterOffset, textareaRect, relativeTextAreaCaretPosition
        ].reduce(
          (acc, el) => ({top: acc.top + el.top, left: acc.left + el.left})
        );
      }
    } 

    return <Form onSubmit={this.props.handleSubmit} className="reply-form">
      <Form.Field>
        <label htmlFor="content">{this.props.conversation.get('topic')}</label>
        <Field name="content" component="textarea" withRef ref={getTextarea} 
          onKeyDown={handleKeyDown} onBlur={handleOnBlur} />
      </Form.Field>
      <Button type="submit" disabled={this.props.pristine} primary icon="reply" content="Reply" />

      {absoluteTextAreaCaretPosition && 
        <div className="cite-suggestions" style={absoluteTextAreaCaretPosition}>
          <SourceSuggestions 
            conversation={this.props.conversation} 
            selectedCiteIndex={replyForm.get('selectedCiteIndex')} />
        </div>
      }

      <h5>Sources</h5>
      <ul>
        {
          this.props.sources.map(({match}, index) => 
            <li key={index}><a href={match}>{match}</a></li>
          )
        }
      </ul>
    </Form>;
  }
}

function SourceSuggestions({conversation, selectedCiteIndex}) {
  const sources = conversation.get('sources');
  if (!sources) {
    return null;
  }
  return <ul>
      {
        sources.toList().map((source, sourceIndex) => 
          <li key={sourceIndex} 
            className={classnames({selected: selectedCiteIndex === sourceIndex})}>
              #{source.get('humanSourceId')}: {source.get('href')}
          </li>
        )
        .toJS()
      }
    </ul>;
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
