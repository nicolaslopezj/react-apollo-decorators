import React from 'react'
import {withApollo} from 'react-apollo'
import getVariables from './getVariables'
import autobind from 'autobind-decorator'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'

export default function(subscription, functionName, config) {
  return function(ComposedComponent) {
    class WithSubscription extends React.Component {
      static propTypes = {
        client: PropTypes.object
      }

      constructor(props) {
        super(props)

        this.client = props.client
        this.initialize(props)
      }

      componentDidMount() {
        this.startSubscription()
      }

      getVariables(subscription, config, props) {
        return config && config.getVariables
          ? config.getVariables(props)
          : getVariables(subscription, config, props)
      }

      componentDidUpdate(prevProps, prevState) {
        const currentVariables = this.getVariables(subscription, config, prevProps)
        const nextVariables = this.getVariables(subscription, config, this.props)
        if (isEqual(currentVariables, nextVariables)) {
          return
        }

        this.initialize(this.props)
        this.startSubscription()
      }

      componentWillUnmount() {
        this.endSubscription()
      }

      @autobind
      initialize(props) {
        if (this.queryObservable) return
        this.queryObservable = this.client.subscribe({
          query: subscription,
          variables: this.getVariables(subscription, config, props)
        })
      }

      @autobind
      startSubscription() {
        if (this.querySubscription) return
        this.querySubscription = this.queryObservable.subscribe({
          next: this.updateCurrentData,
          error: this.updateError
        })
      }

      @autobind
      updateCurrentData(result) {
        if (!functionName) return
        const updater = this.refs.child[functionName]
        if (!updater) {
          return console.log(
            'The second parameter of @withSubscription must be the name of a function in the component. You must put this decorator right before the component'
          )
        }
        updater(result.data)
      }

      @autobind
      updateError(error) {
        console.error('Error in subscription', error)
      }

      @autobind
      endSubscription() {
        if (this.querySubscription) {
          this.querySubscription.unsubscribe()
          delete this.querySubscription
        }
      }

      render() {
        return <ComposedComponent ref="child" {...this.props} />
      }
    }

    WithSubscription.propTypes = ComposedComponent.propTypes
    WithSubscription.defaultProps = ComposedComponent.defaultProps
    WithSubscription.navigationOptions = ComposedComponent.navigationOptions

    return withApollo(WithSubscription)
  }
}
