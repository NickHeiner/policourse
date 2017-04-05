import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {toJS} from './utils';
import {getFirebase, firebaseConnect} from 'react-redux-firebase';
import autobind from 'autobind-decorator';
import ConversationList from './components/ConversationList';
import './App.css';

class App extends PureComponent {
  render() {
    return (
        <div className="App">
          <div className="App-header">
            <h1>PoliCourse</h1>
          </div>
          <div className="App-intro">
            <ConversationList />
            <AddConversationButton />
            <SignedInMessage />
            <AuthButton />
          </div>
        </div>
    );
  }
}

@firebaseConnect()
@connect(
  ({firebase}) => ({profile: firebase.get('profile')})
)
class AddConversationButton extends PureComponent {
  render() {
    return <button onClick={this.addConversation}>+</button>;
  }

  @autobind
  addConversation() {
    this.props.firebase.push('/conversations', {
      // I sure hope this is a stable way to find the current user's uid lol.
      hostId: this.props.firebase.auth().currentUser.uid
    });
  }
}

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
