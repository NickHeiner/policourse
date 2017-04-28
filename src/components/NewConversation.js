import React, {PureComponent} from 'react';
import {Field, reduxForm} from 'redux-form/immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {Form, Button, Header, Label, FormField} from 'semantic-ui-react';
import './NewConversation.css';
import _get from 'lodash.get'; 

const renderField = ({input, placeholder, type, meta: {touched, error}}) => (
  <div>
    <input {...input} placeholder={placeholder} type={type}/>
    {touched && (error && <span>{error}</span>)}
  </div>
);

const minTopicLength = 5;
const validate = values => values.get('topic', '').length > minTopicLength 
    ? {} 
    : {topic: `Topics must be at least ${minTopicLength} characters long`};

@reduxForm({form: 'newConversation', validate})
class NewConversationForm extends PureComponent {
  render() {
    return <Form onSubmit={this.props.handleSubmit}>
      <Header as="h2" textAlign="center">What would you like to talk about?</Header>
      <Label htmlFor="topic">Topic</Label>
      <Field 
        name="topic" 
        component={renderField} 
        type="text" 
        placeholder="Should Milo Yiannopoulos be allowed to speak on college campuses?" 
      />
      <div className="start-button-wrapper">
        <Button primary type="submit" disabled={this.props.pristine || this.props.invalid}>Start Conversation</Button>
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
        ...conversation.toJS()
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
