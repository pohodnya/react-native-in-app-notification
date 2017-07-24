import React, { PropTypes, Component } from 'react';
import { Animated, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import DefaultNotificationBody from './DefaultNotificationBody';

const { width } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    width,
  },
});

class Notification extends Component {
  constructor() {
    super();

    this.show = this.show.bind(this);
    this.showNotification = this.showNotification.bind(this);
    this.closeNotification = this.closeNotification.bind(this);

    this.state = {
      animatedValue: new Animated.Value(0),
      isOpen: false,
    };
  }

  show(title = '', message = '', onPress = null) {
    const { closeInterval } = this.props;
    const { isOpen } = this.state;

    // Clear any currently showing notification timeouts so the new one doesn't get prematurely
    // closed
    clearTimeout(this.currentNotificationInterval);

    const showNotificationWithStateChanges = () => {
      this.setState({
        isOpen: true,
        title,
        message,
        onPress,
      }, () => this.showNotification(() => {
        this.currentNotificationInterval = setTimeout(() => {
          this.setState({
            isOpen: false,
            title: '',
            message: '',
            onPress: null,
          }, this.closeNotification);
        }, closeInterval);
      }));
    };

    if (isOpen) {
      this.setState(
        { isOpen: false },
        () => this.closeNotification(showNotificationWithStateChanges),
      );
    } else {
      showNotificationWithStateChanges();
    }
  }

  showNotification(done = () => {}) {
    StatusBar.setHidden(true, 'slide');
    Animated.timing(this.state.animatedValue, {
      toValue: 1,
      duration: this.props.openCloseDuration,
    }).start(done);
  }

  closeNotification(done = () => {}) {
    StatusBar.setHidden(false, 'slide');
    Animated.timing(this.state.animatedValue, {
      toValue: 0,
      duration: this.props.openCloseDuration,
    }).start(done);
  }

  render() {
    const { height, backgroundColour, indent, style } = this.props;
    const { notificationBodyComponent: NotificationBody } = this.props;
    const { animatedValue, title, message, onPress } = this.state;

    return (
      <Animated.View
        style={[
          styles.notification,
          { top: indent },
          { height, backgroundColor: backgroundColour },
          {
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-height, 0],
              }),
            }],
          },
          this.props.style,
        ]}
      >
        <NotificationBody
          title={title}
          message={message}
          onPress={onPress}
          onClose={() => this.setState({ isOpen: false }, this.closeNotification)}
        />
      </Animated.View>
    );
  }
}

Notification.propTypes = {
  closeInterval: PropTypes.number,
  openCloseDuration: PropTypes.number,
  height: PropTypes.number,
  backgroundColour: PropTypes.string,
  indent: PropTypes.number,
  style: PropTypes.object,
  notificationBodyComponent: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
};

Notification.defaultProps = {
  closeInterval: 4000,
  openCloseDuration: 200,
  height: 80,
  backgroundColour: 'white',
  indent: 0,
  style: {},
  notificationBodyComponent: DefaultNotificationBody,
};

export default Notification;
