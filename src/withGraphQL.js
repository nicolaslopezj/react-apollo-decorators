/* eslint-disable react/prop-types */
import {graphql} from 'react-apollo'
import React from 'react'
import Loading from './Loading'
import ErrorComponent from './Error'
import getVariables from './getVariables'
import sleep from './sleep'
import debounce from 'lodash/debounce'
import NetworkError from './NetworkError'

export default function(query, userConfig) {
  return function(ComposedComponent) {
    const defaultConfig = {
      loading: <Loading />,
      networkErrorComponent: <NetworkError />,
      errorComponent: ErrorComponent,
      fetchPolicy: 'cache-and-network',
      options: {}
    }
    const config = {...defaultConfig, ...userConfig}
    class GraphQLQuery extends React.Component {
      constructor(props) {
        super(props)
        this.debouncedTryRefetch = debounce(this.tryRefetch.bind(this), 1000)
      }

      componentDidUpdate() {
        if (this.props.error && this.props.error.networkError) {
          this.debouncedTryRefetch()
        }
      }

      async tryRefetch() {
        await sleep(1000)
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
        const globalComponent = global.apolloNetworkErrorComponent
        const configComponent = config.networkErrorComponent
        if (configComponent) return globalComponent ? <globalComponent /> : configComponent
        return this.renderComposed()
      }

      renderError(error) {
        if (this.props.error.networkError) return this.renderNetworkError()
        error = error || this.props.error
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
        )
          return this.renderLoading()
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
        const options =
          typeof config.options === 'function' ? config.options(props) : config.options
        return {
          ...options,
          variables: {
            ...getVariables(query, config, props),
            ...(options.variables || {})
          }
        }
      }
    })(GraphQLQuery)

    FinalComponent.propTypes = ComposedComponent.propTypes
    FinalComponent.defaultProps = ComposedComponent.defaultProps

    return FinalComponent
  }
}
