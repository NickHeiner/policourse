import React from 'react';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import {reducer as formReducer} from 'redux-form';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import NoMatch from './components/NoMatch';
import HomePage from './components/HomePage';
import ViewConversationSources from './components/ViewConversationSources';
import ViewConversationFrame from './components/ViewConversationFrame';
import ViewConversationDialogue from './components/ViewConversationDialogue';
import LeaveConversation from './components/LeaveConversation';
import NewConversation from './components/NewConversation';
import {createLogger} from 'redux-logger';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {ensureNativeJSValue} from './utils';
import {reactReduxFirebase, firebaseStateReducer} from 'react-redux-firebase';

const logger = createLogger({stateTransformer: ensureNativeJSValue});

const firebaseConfig = {
  apiKey: 'AIzaSyCGnYHyEB2_iHhVmrvnHYkpt_KJlxyb3k0',
  authDomain: 'policourse.firebaseapp.com',
  databaseURL: 'https://policourse.firebaseio.com',
  projectId: 'policourse',
  messagingSenderId: '603341743697'
};

const rootReducer = combineReducers({
  firebase: firebaseStateReducer,
  form: formReducer.plugin({
    reply: (state, action) => {
      switch (action.type) {
      case '@@reactReduxFirebase/SET': 
        return action.requested ? undefined : state;
      default:
        return state;
      }
    }
  })
});

const createStoreWithFirebase = compose(
  reactReduxFirebase(firebaseConfig, {userProfile: 'users'}),
)(createStore);

const store = createStoreWithFirebase(rootReducer, applyMiddleware(logger));

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={HomePage} />
        <Route path="conversation">
          <Route path="new" component={NewConversation} />
          <Route path=":id" component={ViewConversationFrame}>
            <IndexRoute component={ViewConversationDialogue} />
            <Route path="sources" component={ViewConversationSources} />
            <Route path="leave" component={LeaveConversation} />
          </Route>
        </Route>
      </Route>
      <Route path="*" component={NoMatch} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
