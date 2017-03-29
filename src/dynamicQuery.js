import React from 'react'
import withGraphQL from './withGraphQL'
import gql from 'graphql-tag'

export default function (getQuery, userOptions) {
  return function (ComposedComponent) {
    class Composer extends React.Component {

      getComponent () {
        const query = getQuery(this.props)
        return withGraphQL(gql`${query}`, userOptions)(ComposedComponent)
      }

      componentWillMount () {
        this.component = this.getComponent()
      }

      componentDidUpdate (prevProps, prevState) {
        if (getQuery(prevProps) !== getQuery(this.props)) {
          this.component = this.getComponent()
        }
      }

      render () {
        console.log(this.component, 'c')
        return <this.component {...this.props} />
      }

    }

    return Composer
  }
}
