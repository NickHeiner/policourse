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
            <SignedInMessage />
            <AuthButton />
          </p>
        </div>
    );
  }
}

@connect(
  state => ({currentUser: state.local.get('currentUser')}),
)
@toJS
class SignedInMessage extends React.PureComponent {
  render() {
    const {currentUser: {loggedIn, name}} = this.props;
    return loggedIn ? <span>Logged in as {name}</span> : null;
  }
}

@connect(
  state => ({currentUser: state.local.get('currentUser')}),
  dispatch => 
    ({onSignInClick: () => dispatch({type: 'SIGN_IN'})})
)
@toJS
class AuthButton extends React.PureComponent {
  render() {
    const {currentUser, onSignInClick} = this.props;
    return <button onClick={onSignInClick}>
      {currentUser.loggedIn ? 'Sign out' : 'Sign in'}
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
