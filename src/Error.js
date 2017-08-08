import React from 'react'

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
    error: React.PropTypes.object
  }

  renderGraphQL() {
    return (
      <div style={styles.container}>
        <div style={styles.title}>GraphQL Error:</div>
        {this.props.error.graphQLErrors.map((error, index) => {
          return (
            <div key={index}>
              {error.message}
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    if (this.props.error.graphQLErrors) {
      return this.renderGraphQL()
    }
    return (
      <div style={styles.container}>
        <div style={styles.title}>Error:</div>
        {String(this.props.error)}
      </div>
    )
  }
}
