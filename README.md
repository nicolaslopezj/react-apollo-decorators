# React Apollo Decorators

Better decorators for Apollo and React.

3 decorators that work on top of Apollo default decorator and make you code in a more *declarative* way.

### ```@withGraphQL(query, options)```

Use this decorator to make GraphQL ```query```.

Differences with apollo's ```graphql``` decorator:

- Props will be directly passed to query variables (filtering which are not present in the query).
- Instead of getting the result of the query in the ```data``` prop of the component, you get each query variable as a prop.
- The component will not be rendered until the query is loaded, instead it will show a Loading screen.

```js
import withGraphQL from 'react-apollo-decorators/lib/withGraphQL'
```

- **query**: GraphQL document containing the query.
- **options**: 
  - **loading**: Loading component. Set to null to render the component when the query hasn't finish loading.
  - Other options of apollo's ```graphql``` decorator.

### ```@withMutation(mutation, options)```

Use this decorator to make GraphQL ```mutation```.

Differences with apollo's ```graphql``` decorator:

- Instead of getting the mutation in the ```mutate``` prop, you get it as the name you gave it.
- The first argument of the ```mutate``` function are the variables, the seconds are the options.
- The result of the mutation is return as directly in the function, not inside the data prop.

```js
import withMutation from 'react-apollo-decorators/lib/withMutation'
```

- **mutation**: GraphQL document containing the mutation.
- **options**: Options of apollo's ```graphql``` decorator.

### ```@withFragment(fragment, fragments)```

Use this decorator along with ```withGraphQL``` to use fragments.

```js
import withFragment from 'react-apollo-decorators/lib/withFragment'
```

- **fragment**: GraphQL document containing the fragment.
- **fragments**: Array of fragments used in this fragment definition.

## Example

```js
render () {
  return <Example section='main'/>
}
```

File ```Example.js```:

This files receives the prop section and passes it directly to the query.
It includes the fragment of the ```Content``` component.

```js
import React from 'react'
import withGraphQL from 'react-apollo-decorators/lib/withGraphQL'
import gql from 'graphql-tag'
import Content from './Content'
import Save from './Save'

@withGraphQL(gql`query getMyData ($section: String) {
  dataForSection (section: $section) {
    ...${Content.fragmentName}
  }
}`, {
  fragments: [...Content.fragment]
})
export default class Example extends React.Component {

  static propTypes = {
    dataForSection: React.PropTypes.object,
    section: React.PropTypes.string
  }

  render () {
    return (
      <div>
        <Content data={this.props.dataForSection} />
        <Save data={this.props.dataForSection} />
      </div>
    )
  }

}
```

File ```Content.js```:

Using ```withFragment``` on this component adds the variables ```fragmentName``` which has to be 
used in the query and the variable ```fragment``` which has to be passed in the ```fragments``` 
option in ```withGraphQL```.

```js
import React from 'react'
import withFragment from 'react-apollo-decorators/lib/withFragment'
import gql from 'graphql-tag'

@withFragment(gql`fragment dataContent on Data {
  title
  description
}`)
export default class Content extends React.Component {

  static propTypes = {
    data: React.PropTypes.object
  }

  render () {
    return (
      <div>
        <h1>{this.props.data.title}</h1>
        <p>{this.props.data.description}</p>
      </div>
    )
  }

}
```

File ```Save.js```:

```js
import React from 'react'
import withMutation from 'react-apollo-decorators/lib/withMutation'
import gql from 'graphql-tag'

@withMutation(gql`mutation save ($title: String, $description: String) {
  saveData (title: $title, description: $description) {
    title
    description
  }
}`)
export default class Save extends React.Component {

  static propTypes = {
    data: React.PropTypes.object,
    save: React.PropTypes.func
  }

  async save () {
    try {
      const result = await this.props.save({
        title: this.state.title,
        description: this.state.description
      })
      console.log('Success', result)
    } catch (error) {
      console.log('Error', error)
    }
  }

  render () {
    return (
      <button onClick={this.save.bind(this)}/>
    )
  }

}
```
