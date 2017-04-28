import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {toJS} from './utils';
import {Link} from 'react-router';
import {getFirebase} from 'react-redux-firebase';
import {Header, Modal, ModalHeader, ModalActions, ModalContent} from 'semantic-ui-react';

@connect(
  state => ({
    modal: state.ui.get('modal')
  })
)
class App extends PureComponent {
  render() {
    return (
        <div>
          <div className="app-header">
            <Header as="h1" className="centered"><Link to="/">PoliCourse</Link></Header>
          </div>
          <div className="centered">
            {this.props.children}
            <SignedInMessage />
            <AuthButton />
          </div>
          <UnauthorizedCreateConversationModal open={Boolean(this.props.modal)} />
        </div>
    );
  }
}

@connect(
  null,
  dispatch => ({
    dismissModal() {
      dispatch({
        type: 'DISMISS_MODAL'
      });
    }
  })
)
class UnauthorizedCreateConversationModal extends PureComponent {
  render() {
    return <Modal open={this.props.open} onClose={this.props.dismissModal}>
      <ModalHeader>You must be signed in to create a conversation.</ModalHeader>
      <ModalContent>
        <ModalActions><AuthButton /></ModalActions>
      </ModalContent>
    </Modal>;
  }
}

// What is the difference between getting 'profile' and 'auth'?
@connect(
  ({firebase}) => ({profile: firebase.get('profile')})
)
@toJS
class SignedInMessage extends PureComponent {
  render() {
    const {profile} = this.props;
    return profile ? <span>Logged in as {profile.displayName}</span> : null;
  }
}

@connect(
  ({firebase}) => ({profile: firebase.get('profile')}),
  () => 
    ({onClick: signIn => {
      const firebase = getFirebase();
      if (signIn) {
        firebase.login({provider: 'Google'});
      } else {
        firebase.logout();
      }
    }})
)
@toJS
class AuthButton extends PureComponent {
  render() {
    const {profile, onClick} = this.props;
    return <button onClick={() => onClick(!profile)}>
      {profile ? 'Sign out' : 'Sign in'}
    </button>;
  }
}

export default App;
