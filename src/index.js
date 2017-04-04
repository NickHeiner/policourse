import React from 'react';
import {Provider} from 'react-redux';
import {fromJS} from 'immutable';
import {createStore, applyMiddleware} from 'redux';
import {createLogger} from 'redux-logger';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {ensureNativeJSValue} from './utils';

const logger = createLogger({stateTransformer: ensureNativeJSValue});

const initialState = fromJS({currentUser: {name: 'Nick'}});
function reducer(state = initialState, action) {
  switch (action.type) {
  case 'SIGN_IN': 
    return state.setIn(['currentUser', 'loggedIn'], true);
  default:
    return state;
  }
}

const store = createStore(reducer, applyMiddleware(logger));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
