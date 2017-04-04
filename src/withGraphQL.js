/* eslint-disable react/prop-types */
import {graphql} from 'react-apollo'
import React from 'react'
import Loading from './Loading'
import ErrorComponent from './Error'
import getVariables from './getVariables'
import sleep from './sleep'
import debounce from 'lodash/debounce'
import NetworkError from './NetworkError'

const defaultOptions = {
  loading: <Loading />,
  networkErrorComponent: <NetworkError />,
  fetchPolicy: 'cache-and-network',
  variables: {}
}

export default function (query, userOptions) {
  const options = {...defaultOptions, ...userOptions}
  return function (ComposedComponent) {
    class GraphQLQuery extends React.Component {

      constructor (props) {
        super(props)
        this.debouncedTryRefetch = debounce(this.tryRefetch.bind(this), 1000)
      }

      componentDidUpdate () {
        if (this.props.error && this.props.error.networkError) {
          this.debouncedTryRefetch()
        }
      }

      async tryRefetch () {
        await sleep(1000)
        if (!this.props.error || !this.props.error.networkError) return
        try {
          await this.props.refetch()
        } catch (error) {
          console.warn('Error refetching:', error)
        }
      }

      componentWillUnmount () {
        if (this.interval) {
          clearInterval(this.interval)
        }
      }

      renderLoading () {
        if (!options.loading) return this.renderComposed()
        return options.loading
      }

      renderNetworkError () {
        if (options.loading) return options.loading
        if (options.networkErrorComponent) return options.networkErrorComponent
        return this.renderComposed()
      }

      renderError () {
        if (this.props.error.networkError) return this.renderNetworkError()
        return <ErrorComponent error={this.props.error} />
      }

      renderComposed () {
        try {
          return <ComposedComponent {...this.props} />
        } catch (error) {
          return <ErrorComponent error={error} />
        }
      }

      render () {
        if ((this.props.networkStatus === 1 && Object.keys(this.props.data).length === 10) || this.props.networkStatus === 2) return this.renderLoading()
        if (this.props.error) return this.renderError()
        return this.renderComposed()
      }

    }

    return graphql(query, {
      props: ({ ownProps, data }) => ({
        data,
        ...data,
        ...ownProps
      }),
      options: props => {
        return {
          ...options,
          variables: getVariables(query, options, props)
        }
      }
    })(GraphQLQuery)
  }
}
