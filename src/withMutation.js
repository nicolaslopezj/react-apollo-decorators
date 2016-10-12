import {graphql} from 'react-apollo'
import React from 'react'
import filterObject from './filterObject'
import {getFragments} from './withFragment'
import _ from 'underscore'

const defaultOptions = {
}

export default function (query, userOptions) {
  const options = {...defaultOptions, ...userOptions}

  return function (ComposedComponent) {
    class GraphQLContainer extends React.Component {

      static propTypes = {
        data: React.PropTypes.object,
        mutate: React.PropTypes.func
      }

      getFunctionName () {
        return query.definitions[0].name.value
      }

      getMutate () {
        if (!this.props.mutate) return
        const mutate = async (variables, options = {}, ...args) => {
          options.variables = filterObject(variables, '__typename')
          const result = await this.props.mutate(options, ...args)
          return result.data
        }
        const props = {}
        const mutationName = this.getFunctionName()
        props[mutationName] = mutate
        return props
      }

      getPassProps () {
        return {
          ..._.omit(this.props, 'mutate'),
          ...this.getMutate()
        }
      }

      renderLoading () {
        return React.cloneElement(options.loading, this.getPassProps())
      }

      renderError () {
        return (
          <div>
            {this.props.data.error}
          </div>
        )
      }

      render () {
        return <ComposedComponent {...this.getPassProps()} />
      }

    }

    const container = graphql(query, {
      options: (props) => {
        return {
          ...options,
          fragments: getFragments(options.fragments)
        }
      }
    })(GraphQLContainer)

    container.propTypes = ComposedComponent.propTypes

    return container
  }
}
