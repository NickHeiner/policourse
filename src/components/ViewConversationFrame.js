import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Header, Menu} from 'semantic-ui-react';
import './ViewConversationFrame.css';
import _ from 'lodash';

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

    const currentPathname = this.props.router.getCurrentLocation().pathname;
    const discussionPath = `/conversation/${this.props.routeParams.id}`;
    const discussionActive = currentPathname === discussionPath;
    const sourcesPath = `/conversation/${this.props.routeParams.id}/sources`;
    const sourcesActive = currentPathname === sourcesPath;

    return <div>
        <Header as="h3" textAlign="center">{conversation.get('topic')}</Header>

        {this.props.children}

        {_.get(_.last(this.props.routes), 'showConversationNav', true) && 
          <Menu tabular attached="bottom" as="ul" className="view-conversation-menu">
            <Menu.Item as="li" name="Discussion" active={discussionActive} onClick={this.handleItemClick}>
              <Link to={discussionPath} activeClassName="active" onlyActiveOnIndex={true}>
                Discussion
              </Link>
            </Menu.Item>
            <Menu.Item as="li"name="Sources" active={sourcesActive} onClick={this.handleItemClick}>
              <Link to={sourcesPath} activeClassName="active">Sources</Link>
            </Menu.Item>
          </Menu>
        }
    </div>;
  }
}

export default ViewConversationFrame;
