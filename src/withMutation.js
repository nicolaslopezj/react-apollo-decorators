/* eslint-disable react/prop-types */
import {graphql} from 'react-apollo'
import filterObject from './filterObject'
import cloneDeep from 'lodash/cloneDeep'

export default function(query, userConfig) {
  return function(ComposedComponent) {
    const defaultConfig = {options: {}}
    const config = {...defaultConfig, ...userConfig}

    const changeMutate = oldMutate => async (variables, options = {}, ...args) => {
      options.variables = filterObject(cloneDeep(variables), '__typename')
      const result = await oldMutate(options, ...args)
      return result.data
    }

    const FinalComponent = graphql(query, {
      ...config,
      props: ({ownProps, mutate}) => {
        const mutationName = query.definitions[0].name.value
        return {
          ...ownProps,
          [mutationName]: changeMutate(mutate)
        }
      }
    })(ComposedComponent)

    FinalComponent.propTypes = ComposedComponent.propTypes
    FinalComponent.defaultProps = ComposedComponent.defaultProps

    return FinalComponent
  }
}
