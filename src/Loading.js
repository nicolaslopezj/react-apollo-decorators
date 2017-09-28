import React from 'react'
import PropTypes from 'prop-types'

export default class Loading extends React.Component {
  static propTypes = {
    height: PropTypes.number
  }

  static defaultProps = {
    height: 200
  }

  getStyles() {
    return {
      height: this.props.height,
      backgroundColor: '#EEEEEE',
      borderRadius: 3
    }
  }

  render() {
    return <div style={this.getStyles()} />
  }
}
