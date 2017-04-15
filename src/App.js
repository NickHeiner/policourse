import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {toJS} from './utils';
import {Link} from 'react-router';
import {getFirebase} from 'react-redux-firebase';
import {Header} from 'semantic-ui-react';

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
