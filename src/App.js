import React, {Component} from 'react';
import logo from './logo.svg';
import {connect} from 'react-redux';
import {ensureNativeJSValue} from './utils';
import {getFirebase} from 'react-redux-firebase';
import './App.css';

class App extends Component {
  render() {
    return (
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </div>
          <p className="App-intro">
            <SignedInMessage />
            <AuthButton />
          </p>
        </div>
    );
  }
}

@connect(
  ({firebase}) => ({profile: firebase.get('profile')})
)
@toJS
class SignedInMessage extends React.PureComponent {
  render() {
    const {profile} = this.props;
    return profile ? <span>Logged in as {profile.displayName}</span> : null;
  }
}

@connect(
  ({firebase}) => ({profile: firebase.get('profile')}),
  () => 
    ({onSignInClick: () => getFirebase().login({provider: 'Google'})})
)
@toJS
class AuthButton extends React.PureComponent {
  render() {
    const {profile, onSignInClick} = this.props;
    return <button onClick={onSignInClick}>
      {profile ? 'Sign out' : 'Sign in'}
    </button>;
  }
}

function toJS(WrappedComponent) {
  function ToJSWrapper(wrappedComponentProps) {
    const propsJS = Object.entries(wrappedComponentProps)
      .reduce((newProps, [key, value]) => ({
        ...newProps,
        [key]: ensureNativeJSValue(value)
      }), {});

    return <WrappedComponent {...propsJS} />;
  }

  ToJSWrapper.displayName = `toJS(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ToJSWrapper;
}

export default App;
