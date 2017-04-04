import React, {Component} from 'react';
import logo from './logo.svg';
import {connect} from 'react-redux';
import {ensureNativeJSValue} from './utils';
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
            <ConnectedSignInMessage />
            <ConnectedAuthButton />
          </p>
        </div>
    );
  }
}

const SignedInMessage = ({currentUser: {loggedIn, name}}) => loggedIn ? <span>Logged in as {name}</span> : null;
const ConnectedSignInMessage = connect(
  state => ({currentUser: state.get('currentUser')}),
)(toJS(SignedInMessage));

const AuthButton = ({currentUser, onSignInClick}) => <button onClick={onSignInClick}>
    {currentUser.loggedIn ? 'Sign out' : 'Sign in'}
  </button>;

const ConnectedAuthButton = connect(
  state => ({currentUser: state.get('currentUser')}),
  dispatch => 
    ({onSignInClick: () => dispatch({type: 'SIGN_IN'})})
)(toJS(AuthButton));

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
