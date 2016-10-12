import {graphql} from 'react-apollo'
import React from 'react'
import _ from 'underscore'
import Loading from './components/loadings/Basic'
import {listenToken, unlistenToken, getLoginToken} from './accounts/store'
import autobind from 'autobind-decorator'
import filterObject from './helpers/filterObject'
import {getFragments} from './withFragment'

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

      componentWillMount () {
        listenToken(this.refetchQuery)
      }

      componentWillUnmount () {
        unlistenToken(this.refetchQuery)
      }

      @autobind
      refetchQuery () {
        this.props.data.refetch()
      }

      getMutate () {
        if (!this.props.mutate) return
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
        return (
          <div>
            {this.props.data.error}
          </div>
        )
      }

      render () {
        if (this.props.data && this.props.data.loading && options.loading) return this.renderLoading()
        if (this.props.data && this.props.data.error) return this.renderError()
        return <ComposedComponent {...this.getPassProps()}/>
      }

    }

    const variablesInQuery = getPresentVariables(query)
    const container = graphql(query, {
      options: (props) => {
        const optionsVariables = options.variables || {}
        const variables = {..._.pick(props.params || {}, ...variablesInQuery), ..._.pick(props, ...variablesInQuery), ...optionsVariables}
        variables.meteorLoginToken = getLoginToken()
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
