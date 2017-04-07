import React, {PureComponent} from 'react';
import {Field, reduxForm} from 'redux-form/immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';

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
  ({firebase}) => ({
    profile: firebase.get('profile'),
    currentUser: firebase.get('auth')
  })
)
class NewConversation extends PureComponent {
  render() {
    const addConversation = async conversation => {
      const newConversation = await this.props.firebase.push('/conversations', {
        hostId: this.props.currentUser.uid,
        createdAt: this.props.firebase.database.ServerValue.TIMESTAMP,
        ...conversation
      });
      await this.props.firebase.push(`/conversations/${newConversation.key}/joinRecords`, {
        userId: this.props.currentUser.uid,
        createdAt: this.props.firebase.database.ServerValue.TIMESTAMP
      });

      browserHistory.push(`/conversation/${newConversation.key}`);
    };

    return <NewConversationForm onSubmit={addConversation} />;
  }
}

export default NewConversation;
