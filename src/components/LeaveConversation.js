import React, {PureComponent} from 'react';
import {browserHistory} from 'react-router';
import {Field, reduxForm} from 'redux-form/immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {Form, Button, ButtonGroup, Icon} from 'semantic-ui-react';
import LinkButton from './LinkButton';

@firebaseConnect()
@connect(
  ({firebase}) => ({
    conversations: firebase.getIn(['data', 'conversations']),
    currentUser: firebase.get('auth')
  })
)
class LeaveConversation extends PureComponent {
  render() {
    const leaveConversation = leaveFormData => {
      this.props.firebase
        .ref(`/conversations/${this.props.params.id}/leaveRecords/`)
        .push({
          userId: this.props.currentUser.uid,
          createdAt: this.props.firebase.database.ServerValue.TIMESTAMP,
          reason: leaveFormData.get('reason')
        });

      browserHistory.push('/');
    };

    const stayButton = <LinkButton 
      to={`/conversation/${this.props.params.id}`} 
      icon={<Icon name="add user" size="huge" />} label="Stay" positive={true} labelPosition="right" />;

    return <LeaveConversationForm onSubmit={leaveConversation} stayButton={stayButton} />;
  }
}

// This will have one form state across the entire app, which could be problematic.
@reduxForm({form: 'leaveConversation'})
class LeaveConversationForm extends PureComponent {
  render() {
    const {handleSubmit, pristine} = this.props;
    return <Form onSubmit={handleSubmit}>
      <div className="three fields">
        <div className="field">
          <div className="ui radio">
            <Field name="reason" component="input" type="radio" value="agreeToDisagree" />
            <label>
              Let's agree to disagree
            </label>
          </div>
        </div>
        <div className="field">
          <div className="ui radio">
            <Field name="reason" component="input" type="radio" value="uncivil" />
            <label>
              Other participants are being uncivil
            </label>
          </div>
        </div>
        <div className="field">
          <div className="ui radio">
            <Field name="reason" component="input" type="radio" value="nothingLeftToAdd" />
            <label>
              I have nothing left to add
            </label>
          </div>
        </div>
      </div>
      <ButtonGroup fluid={true} widths="two">
        <Button type="submit" 
          disabled={pristine} icon={<Icon name="remove user" size="huge" />} label="Leave" negative={true} 
          labelPosition="left" />
        {this.props.stayButton}
      </ButtonGroup>
    </Form>;
  }
}

export default LeaveConversation;
