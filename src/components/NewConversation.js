import React, {PureComponent} from 'react';
import {Field, reduxForm} from 'redux-form';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import autobind from 'autobind-decorator';

@reduxForm({form: 'newConversation'})
class NewConversationForm extends PureComponent {
  render() {
    return <form onSubmit={this.props.handleSubmit}>
      <h2>What would you like to talk about?</h2>
      <div>
        <label htmlFor="topic">Topic</label>
        <Field 
          name="topic" 
          component="input" 
          type="text" 
          placeholder="Should Milo Yiannopoulos be allowed to speak on college campuses?" 
        />
      </div>
      <button type="submit">Start Conversation</button>
    </form>;
  }
}

@firebaseConnect()
@connect(
  ({firebase}) => ({profile: firebase.get('profile')})
)
class NewConversation extends PureComponent {
  render() {
    return <NewConversationForm onSubmit={this.addConversation} />;
  }

  @autobind
  async addConversation(conversation) {
    // I sure hope this is a stable way to find the current user's uid lol.
    const currentUserId = this.props.firebase.auth().currentUser.uid;
    
    const newConversation = await this.props.firebase.push('/conversations', {
      hostId: currentUserId,
      ...conversation
    });
    await this.props.firebase.push(`/conversations/${newConversation.key}/participants`, currentUserId);

    browserHistory.push(`/conversation/${newConversation.key}`);
  }
}

export default NewConversation;
