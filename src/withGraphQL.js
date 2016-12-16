import {graphql} from 'react-apollo'
import React from 'react'
import _ from 'underscore'
import Loading from './Loading'
import filterObject from './filterObject'
import {getFragments} from './withFragment'
import ErrorComponent from './Error'

let globalQueryIndex = 0
const listeners = []

const listenRefetch = function (callback) {
  listeners.push(callback)
}

const unlistenRefetch = function (callback) {
  var index = listeners.indexOf(callback)
  if (index > -1) {
    listeners.splice(index, 1)
  }
}

export const refetchQueries = function () {
  globalQueryIndex++
  listeners.forEach(callback => callback())
}

const getPresentVariables = function (query) {
  const {definitions} = query
  const variables = []
  definitions.forEach(definition => {
    if (definition.operation === 'query') {
      definition.variableDefinitions.forEach(variable => {
        variables.push(variable.variable.name.value)
      })
    }
  })
  return variables
}

const defaultOptions = {
  loading: <Loading />
}

export default function (query, userOptions) {
  const options = {...defaultOptions, ...userOptions}
  return function (ComposedComponent) {
    class GraphQLContainer extends React.Component {

      static propTypes = {
        data: React.PropTypes.object,
        mutate: React.PropTypes.func
      }

      constructor (props) {
        super(props)
        this.refetchQuery = this.refetchQuery.bind(this)
      }

      refetchQuery () {
        this.props.data.refetch()
      }

      componentWillMount () {
        listenRefetch(this.refetchQuery)
      }

      componentWillUnmount () {
        unlistenRefetch(this.refetchQuery)
      }

      getMutate () {
        if (!this.props.mutate) return
        console.warn('You should use withMutation decorator to use mutations.')
        const newMutate = (options, ...args) => {
          options.variables = filterObject(options.variables, '__typename')
          return this.props.mutate(options, ...args)
        }
        return {
          mutate: newMutate
        }
      }

      getPassProps () {
        return {
          ...this.props,
          ..._.omit(this.props.data, 'fetchMore', 'loading', 'refetch', 'startPolling', 'stopPolling', 'updateQuery', 'variables'),
          ...this.getMutate(),
          isLoading: this.props.data && this.props.data.loading
        }
      }

      renderLoading () {
        return React.cloneElement(options.loading, this.getPassProps())
      }

      renderError () {
        return <ErrorComponent error={this.props.data.error} />
      }

      render () {
        if (this.props.data && this.props.data.loading && options.loading) return this.renderLoading()
        if (this.props.data && this.props.data.error) return this.renderError()
        return <ComposedComponent {...this.getPassProps()} />
      }

    }

    const variablesInQuery = getPresentVariables(query)
    const container = graphql(query, {
      options: (props) => {
        const optionsVariables = options.variables || {}
        const variables = {..._.pick(props.params || {}, ...variablesInQuery), ..._.pick(props, ...variablesInQuery), ...optionsVariables}
        if (globalQueryIndex) {
          variables.globalQueryIndex = globalQueryIndex
        }
        return {
          ...options,
          fragments: getFragments(options.fragments),
          variables
        }
      }
    })(GraphQLContainer)

    container.propTypes = ComposedComponent.propTypes

    return container
  }
}
