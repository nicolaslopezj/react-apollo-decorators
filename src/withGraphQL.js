/* eslint-disable react/prop-types */
import {graphql} from 'react-apollo'
import React from 'react'
import Loading from './Loading'
import ErrorComponent from './Error'
import getVariables from './getVariables'
import sleep from './sleep'
import debounce from 'lodash/debounce'
import NetworkError from './NetworkError'

export default function(query, userConfig = {}) {
  return function(ComposedComponent) {
    const defaultConfig = {
      loading: <Loading />,
      errorComponent: ErrorComponent,
      tryRefetch: 1000
    }
    const config = {...defaultConfig, ...userConfig}
    class GraphQLQuery extends React.Component {
      constructor(props) {
        super(props)
        this.debouncedTryRefetch = debounce(this.tryRefetch.bind(this), config.tryRefetch)
      }

      componentDidUpdate() {
        if (this.props.error && this.props.error.networkError) {
          this.debouncedTryRefetch()
        }
      }

      async tryRefetch() {
        if (!config.tryRefetch) return
        await sleep(config.tryRefetch)
        if (!this.props.error || !this.props.error.networkError) return
        try {
          await this.props.refetch()
        } catch (error) {
          console.log('Error refetching:', error)
        }
      }

      componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval)
        }
      }

      renderLoading() {
        if (!config.loading) return this.renderComposed()
        if (userConfig.loading) return config.loading
        return global.apolloLoadingComponent ? <global.apolloLoadingComponent /> : config.loading
      }

      renderNetworkError() {
        if (!global.apolloNetworkErrorComponent && config.loading) return this.renderLoading()
        const GlobalComponent = global.apolloNetworkErrorComponent
        const ConfigComponent = userConfig.networkErrorComponent
        if (ConfigComponent !== null) {
          if (ConfigComponent) return <ConfigComponent />
          return GlobalComponent ? <GlobalComponent /> : <NetworkError />
        }
        return this.renderComposed()
      }

      renderError(error) {
        error = error || this.props.error
        if (error.networkError) return this.renderNetworkError()
        return global.apolloErrorComponent ? (
          <global.apolloErrorComponent error={error} />
        ) : (
          <ErrorComponent error={error} />
        )
      }

      renderComposed() {
        try {
          return <ComposedComponent {...this.props} />
        } catch (error) {
          return this.renderError(error)
        }
      }

      render() {
        if (
          (this.props.networkStatus === 1 && Object.keys(this.props._data).length === 10) ||
          this.props.networkStatus === 2
        ) {
          return this.renderLoading()
        }

        if (this.props.error) return this.renderError()
        return this.renderComposed()
      }
    }

    const FinalComponent = graphql(query, {
      ...config,
      props: ({ownProps, data}) => ({
        _data: data,
        ...ownProps,
        ...data
      }),
      options: props => {
        const options = config.options
        const userOptions = (typeof options === 'function' ? options(props) : options) || {}
        if (userOptions.pollInterval && !userOptions.fetchPolicy) {
          userOptions.fetchPolicy = 'network-only'
        }
        return {
          fetchPolicy: 'cache-and-network', // default option
          ...userOptions,
          variables: {
            ...getVariables(query, config, props),
            ...(userOptions.variables || {})
          }
        }
      }
    })(GraphQLQuery)

    FinalComponent.propTypes = ComposedComponent.propTypes
    FinalComponent.defaultProps = ComposedComponent.defaultProps
    FinalComponent.navigationOptions = ComposedComponent.navigationOptions

    return FinalComponent
  }
}
