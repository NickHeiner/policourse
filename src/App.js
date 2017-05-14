import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {toJS} from './utils';
import {Link} from 'react-router';
import {getFirebase} from 'react-redux-firebase';
import {Header, Modal, ModalHeader, ModalActions, ModalContent, Image} from 'semantic-ui-react';

@connect(
  state => ({
    modal: state.ui.get('modal')
  })
)
class App extends PureComponent {
  render() {
    let modal;

    switch (this.props.modal) {
    case 'UNAUTH_USER_ATTEMPT_CREATE_CONVERSATION':
      modal = <UnauthorizedCreateConversationModal />;
      break;
    case 'SIGNED_IN_MODAL':
      modal = <SignedInModal />;
      break;
    default:
      modal = null;
    }

    return (
        <div>
          <div className="app-header">
            <Header as="h1" className="centered"><Link to="/">PoliCourse</Link></Header>
            <SignedInMessage />
          </div>
          <div className="centered">
            {this.props.children}
            <AuthButton />
          </div>
          {modal}
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
    return <Modal open={true} onClose={this.props.dismissModal}>
      <ModalHeader>You must be signed in to create a conversation.</ModalHeader>
      <ModalContent>
        <ModalActions><AuthButton /></ModalActions>
      </ModalContent>
    </Modal>;
  }
}

@connect(
  ({firebase}) => ({profile: firebase.get('profile')})
)
@toJS
class SignedInMessage extends PureComponent {
  render() {
    const {profile} = this.props;
    return profile 
      ? <Image src={profile.avatarUrl} 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px'
          }} alt={`Profile picture for ${profile.displayName}`} size="mini" avatar className="signed-in-message" /> 
      : null;
  }
}

@connect(
  ({firebase}) => ({profile: firebase.get('profile')}),
  dispatch => ({
    dismissModal() {
      dispatch({
        type: 'DISMISS_MODAL'
      });
    }
  })
)
class SignedInModal extends PureComponent {
  render() {
    const {profile, dismissModal} = this.props;
    return profile ? <Modal open={true} onClose={dismissModal}>
      <ModalHeader>Signed in as {profile.get('displayName')}</ModalHeader>
      <ModalContent image>
        <Image src={profile.get('avatarUrl')} 
          wrapped size="small" shape="circular"
          alt={`Profile picture for ${profile.get('displayName')}`} className="signed-in-message" />
        <ModalActions><AuthButton /></ModalActions>
      </ModalContent>
    </Modal> : null;
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
class AuthButton extends PureComponent {
  handleClick = () => this.props.onClick(!this.props.profile)

  render() {
    const {profile} = this.props;
    return <button onClick={this.handleClick}>
      {profile ? 'Sign out' : 'Sign in'}
    </button>;
  }
}

export default App;
