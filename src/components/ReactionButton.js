import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';

@firebaseConnect()
class ReactionButton extends PureComponent {
  render() {
    const {
      currentUserId, conversationId, reactingToName, reactingToEntity, reactingToEntityId, reactionId, label, firebase
    } = this.props;

    const reaction = reactingToEntity.getIn(['reactions', reactionId]);
    const userReactionEntry = reaction && reaction.findEntry(userId => userId === currentUserId);

    const handleClick = () => {
      const firebasePath = 
        `/conversations/${conversationId}/${reactingToName}/${reactingToEntityId}/reactions/${reactionId}`;
      if (userReactionEntry) {
        firebase.remove(`${firebasePath}/${userReactionEntry[0]}`);
      } else {
        firebase.push(firebasePath, currentUserId);
      }
    };

    const existingReactionCount = reaction ? reaction.size : 0;
    const text = `${(userReactionEntry ? 'Unset' : 'Set')} ${label} (${existingReactionCount})`;

    return <button onClick={handleClick}>{text}</button>;
  }
}

export default ReactionButton;
