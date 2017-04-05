import React from 'react';
import {Provider} from 'react-redux';
import {fromJS} from 'immutable';
import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import {Router, Route, browserHistory} from 'react-router';
import NoMatch from './components/NoMatch';
import {createLogger} from 'redux-logger';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {ensureNativeJSValue} from './utils';
import {reactReduxFirebase, firebaseStateReducer} from 'react-redux-firebase';

const logger = createLogger({stateTransformer: ensureNativeJSValue});

const initialState = fromJS({currentUser: {}});
function local(state = initialState, action) {
  switch (action.type) {
  case 'SIGN_IN': 
    return state
      .setIn(['currentUser', 'loggedIn'], true)
      .setIn(['currentUser', 'name'], 'Nick');
  default:
    return state;
  }
}

const firebaseConfig = {
  apiKey: 'AIzaSyCGnYHyEB2_iHhVmrvnHYkpt_KJlxyb3k0',
  authDomain: 'policourse.firebaseapp.com',
  databaseURL: 'https://policourse.firebaseio.com',
  projectId: 'policourse',
  messagingSenderId: '603341743697'
};

const rootReducer = combineReducers({
  firebase: firebaseStateReducer,
  local
});

const createStoreWithFirebase = compose(
  reactReduxFirebase(firebaseConfig, {userProfile: 'users'}),
)(createStore);

const store = createStoreWithFirebase(rootReducer, applyMiddleware(logger));

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} />
      <Route path="*" component={NoMatch} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
