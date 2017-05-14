import React, {PureComponent} from 'react';
import {firebaseConnect} from 'react-redux-firebase';
import {Button} from 'semantic-ui-react';

@firebaseConnect()
class ReactionButton extends PureComponent {
  render() {
    const {
      currentUserId, conversationId, reactingToName, reactingToEntity, reactingToEntityId, reactionId, label, firebase,
      icon, ...extraProps
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
    const color = userReactionEntry ? 'blue' : undefined;

    return <Button onClick={handleClick} color={color} basic
      content={label} icon={icon} label={{content: existingReactionCount, color}} 
      {...extraProps} />;
  }
}

export default ReactionButton;
