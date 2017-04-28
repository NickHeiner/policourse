import React, {PureComponent} from 'react';
import ConversationList from './ConversationList';
import {Link} from 'react-router';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {Button} from 'semantic-ui-react';

@firebaseConnect()
@connect(
  ({firebase}) => ({
    isInitializing: firebase.get('isInitializing'),
    currentUser: firebase.get('auth')
  }),
  dispatch => ({
    onUnauthenticatedUserAttemptToCreateConversation() {
      dispatch({
        type: 'UNAUTH_USER_ATTEMPT_CREATE_CONVERSATION'
      });
    }
  })
)
class HomePage extends PureComponent {
  render() {
    const getAddButton = () => {
      if (this.props.isInitializing) {
        return null;
      }

      if (this.props.currentUser) {
        return <Link to="/conversation/new"><PlusButton /></Link>;
      }

      return <PlusButton onClick={this.props.onUnauthenticatedUserAttemptToCreateConversation} />;
    }
    return <div>
        <ConversationList />
        <div className="new-button">{getAddButton()}</div>
    </div>;
  }
}

const PlusButton = props => <Button icon="plus" {...props} />

export default HomePage;
