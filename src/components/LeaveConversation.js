import React, {PureComponent} from 'react';
import {Link, browserHistory} from 'react-router';
import {Field, reduxForm} from 'redux-form/immutable';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';

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
          reason: leaveFormData.reason
        });

      browserHistory.push('/');
    };

    return <div>
        <LeaveConversationForm onSubmit={leaveConversation} />
        <Link to={`/conversation/${this.props.params.id}`}><button>Stay</button></Link>
    </div>;
  }
}

// This will have one form state across the entire app, which could be problematic.
@reduxForm({form: 'leaveConversation'})
class LeaveConversationForm extends PureComponent {
  render() {
    const {handleSubmit, pristine} = this.props;
    return <form onSubmit={handleSubmit}>
      <label>
        <Field name="reason" component="input" type="radio" value="agreeToDisagree"/>
        Let's agree to disagree
      </label>
      <label>
        <Field name="reason" component="input" type="radio" value="uncivil"/>
        Other participants are being uncivil
      </label>
      <label>
        <Field name="reason" component="input" type="radio" value="nothingLeftToAdd"/>
        I have nothing left to add
      </label>
      <button type="submit" disabled={pristine}>Leave</button>
    </form>;
  }
}

export default LeaveConversation;
