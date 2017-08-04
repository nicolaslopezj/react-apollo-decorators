import React from 'react'

export default class Loading extends React.Component {
  static propTypes = {
    height: React.PropTypes.number
  }

  static defaultProps = {
    height: 200
  }

  getStyles () {
    return {
      height: this.props.height,
      backgroundColor: '#EEEEEE',
      borderRadius: 3
    }
  }

  render () {
    return (
      <div style={this.getStyles()} />
    )
  }
}
