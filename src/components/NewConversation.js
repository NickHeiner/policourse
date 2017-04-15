import React, {PureComponent} from 'react';
import {Field, reduxForm} from 'redux-form/immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {Form, Button, Header} from 'semantic-ui-react';
import './NewConversation.css'; 

@reduxForm({form: 'newConversation'})
class NewConversationForm extends PureComponent {
  render() {
    return <Form onSubmit={this.props.handleSubmit}>
      <Header as="h2" textAlign="center">What would you like to talk about?</Header>
      <div>
        <label htmlFor="topic">Topic</label>
        <Field 
          name="topic" 
          component="input" 
          type="text" 
          placeholder="Should Milo Yiannopoulos be allowed to speak on college campuses?" 
        />
      </div>
      <div className="start-button-wrapper">
        <Button primary type="submit">Start Conversation</Button>
      </div>
    </Form>;
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
