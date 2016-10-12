# Example

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
