import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {toJS} from './utils';
import {getFirebase} from 'react-redux-firebase';
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
            <SignedInMessage />
            <AuthButton />
          </div>
        </div>
    );
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
