import {graphql, withApollo} from 'react-apollo'
import React from 'react'
import Loading from './Loading'
import ErrorComponent from './Error'
import NetworkError from './NetworkError'
import getVariables from './getVariables'

const defaultOptions = {
  loading: <Loading />,
  fetchPolicy: 'cache-and-network',
  variables: {}
}

export default function (query, userOptions) {
  const options = {...defaultOptions, ...userOptions}
  return function (ComposedComponent) {
    class GraphQLQuery extends React.Component {

      static propTypes = {
        loading: React.PropTypes.bool,
        error: React.PropTypes.object,
        refetch: React.PropTypes.func,
        client: React.PropTypes.object
      }

      componentDidUpdate (prevProps, prevState) {
        const hasNetworkError = this.props.error && !!this.props.error.networkError
        const hadNetworkError = prevProps.error && !!prevProps.error.networkError
        if (hasNetworkError && !hadNetworkError) {
          this.interval = setInterval(async () => {
            try {
              await this.props.refetch()
            } catch (error) {
              console.log(error)
            }
          }, 3000)
        } else if (!hasNetworkError && hadNetworkError) {
          clearInterval(this.interval)
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
        return <NetworkError />
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
        if (this.props.loading) return this.renderLoading()
        if (this.props.error) return this.renderError()
        return this.renderComposed()
      }

    }

    return withApollo(graphql(query, {
      props: ({ ownProps, data }) => ({
        data,
        ...ownProps,
        ...data
      }),
      options: props => {
        return {
          ...options,
          variables: getVariables(query, options, props)
        }
      }
    })(GraphQLQuery))
  }
}
