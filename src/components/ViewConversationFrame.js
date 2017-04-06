import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {Link} from 'react-router';

@firebaseConnect(['/conversations'])
@connect(
  ({firebase}) => ({
    conversations: firebase.getIn(['data', 'conversations']),
    requestedConversations: firebase.getIn(['requested', 'conversations'])
  })
)
class ViewConversationFrame extends PureComponent {
  render() {
    const {conversations} = this.props;
    if (!this.props.requestedConversations && !conversations) {
      return null;
    }

    const notFound = <p>This conversation does not exist. Perhaps you followed a broken link?</p>;

    if (!conversations) {
      return notFound;
    }

    const conversation = conversations.get(this.props.routeParams.id);

    if (!conversation) {
      return notFound;
    }

    return <div>
        <h3>{conversation.get('topic')}</h3>

        {this.props.children}

        <ul>
          <li>
            <Link to={`/conversation/${this.props.routeParams.id}`} activeClassName="active" onlyActiveOnIndex={true}>
              Discussion
            </Link>
          </li>
          <li>
            <Link to={`/conversation/${this.props.routeParams.id}/sources`} activeClassName="active">Sources</Link>
          </li>
        </ul>
    </div>;
  }
}

export default ViewConversationFrame;
