import React from 'react'
import withGraphQL from './withGraphQL'
import gql from 'graphql-tag'

export default function (getQuery, userOptions) {
  return function (ComposedComponent) {
    class Composer extends React.Component {
      getComponent (props) {
        const query = getQuery(props)
        return withGraphQL(gql`${query}`, userOptions)(ComposedComponent)
      }

      componentWillMount () {
        this.component = this.getComponent(this.props)
      }

      componentWillReceiveProps (nextProps) {
        if (getQuery(this.props) !== getQuery(nextProps)) {
          this.component = this.getComponent(nextProps)
        }
      }

      render () {
        return <this.component {...this.props} />
      }
    }

    return Composer
  }
}
