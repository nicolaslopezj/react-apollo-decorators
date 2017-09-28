import React from 'react'
import PropTypes from 'prop-types'

const styles = {
  container: {
    backgroundColor: '#eee',
    color: '#FF3B30',
    padding: 20,
    fontFamily: 'monospace',
    fontSize: 16
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
    fontWeight: 700
  }
}

export default class Error extends React.Component {
  static propTypes = {
    error: PropTypes.object
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Connection Error</div>
        Trying to reconnect...
      </div>
    )
  }
}
