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
import {fromJS} from 'immutable';
import {ensureNativeJSValue} from './utils';
import {reactReduxFirebase, firebaseStateReducer} from 'react-redux-firebase';
import {composeWithDevTools} from 'redux-devtools-extension';

const logger = createLogger({stateTransformer: ensureNativeJSValue});

const firebaseConfig = {
  apiKey: 'AIzaSyCGnYHyEB2_iHhVmrvnHYkpt_KJlxyb3k0',
  authDomain: 'policourse.firebaseapp.com',
  databaseURL: 'https://policourse.firebaseio.com',
  projectId: 'policourse',
  messagingSenderId: '603341743697'
};

function uiReducer(state = fromJS({}), action = {}) {
  switch (action.type) {
  case 'TEXTAREA_CARET_POSITION_UPDATE':
    return state.setIn(['viewConversation', 'replyForm', 'textAreaCaretPosition'], action.payload);
  case 'START_TYPING_CITE':
    return state.setIn(['viewConversation', 'replyForm', 'showCiteSuggestions'], true);
  case 'STOP_TYPING_CITE':
    return state.setIn(['viewConversation', 'replyForm', 'showCiteSuggestions'], false);
  case 'CITE_SUGGESTION_SELECTED_INCREMENT':
    return (() => {
      const selectedCiteIndexPath = ['viewConversation', 'replyForm', 'selectedCiteIndex'];
      const currIndex = state.getIn(selectedCiteIndexPath, 0);
      return state.setIn(selectedCiteIndexPath, Math.min(action.payload.sourceCount - 1, currIndex + 1));
    })();
  case 'CITE_SUGGESTION_SELECTED_DECREMENT':
    return (() => {
      const selectedCiteIndexPath = ['viewConversation', 'replyForm', 'selectedCiteIndex'];
      const currIndex = state.getIn(selectedCiteIndexPath, 0);
      return state.setIn(selectedCiteIndexPath, Math.max(0, currIndex - 1));
    })();
  default:
    return state;
  }
}

// TODO All of our state is an ImmutableJS object, except the very top level. We should fix that.
// We may need another redux package to get an immutable-aware combineReducers function.
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
  }),
  ui: uiReducer
});

const createStoreWithFirebase = compose(
  reactReduxFirebase(firebaseConfig, {userProfile: 'users'}),
)(createStore);

const store = createStoreWithFirebase(rootReducer, composeWithDevTools(applyMiddleware(logger)));

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
