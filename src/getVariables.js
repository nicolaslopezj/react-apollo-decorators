export default function(query, options, props) {
  const operationVariables = query.definitions[0].variableDefinitions || []
  const variables = {}

  for (const operationVariable of operationVariables) {
    const {variable, type} = operationVariable
    if (!variable.name || !variable.name.value) continue

    if (typeof props[variable.name.value] !== 'undefined') {
      variables[variable.name.value] = props[variable.name.value]
      continue
    }

    if (props.params && typeof props.params[variable.name.value] !== 'undefined') {
      variables[variable.name.value] = props.params[variable.name.value]
      continue
    }

    if (
      props.match &&
      props.match.params &&
      typeof props.match.params[variable.name.value] !== 'undefined'
    ) {
      variables[variable.name.value] = props.match.params[variable.name.value]
      continue
    }

    if (
      props.navigation &&
      props.navigation.state &&
      props.navigation.state.params &&
      typeof props.navigation.state.params[variable.name.value] !== 'undefined'
    ) {
      variables[variable.name.value] = props.navigation.state.params[variable.name.value]
      continue
    }

    // allow optional props
    if (type.kind !== 'NonNullType') {
      variables[variable.name.value] = null
      continue
    }
  }
  return variables
}
