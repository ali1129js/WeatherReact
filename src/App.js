/**
 * @Author: Ali
 * @Date:   2018-05-05T17:04:42+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-05T19:10:03+02:00
 */
import React, { Component, Fragment } from 'react'
import Form from './Components/Form'
const API_KEY = '32941f4c12936fc51133cb69ca8f8b8a'
class App extends Component {
  getWeather = async (e) => {
    e.preventDefault()
    const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=London,uk&appid=${API_KEY}&units=metric`)
    const data = await api_call.json()
    console.log(data)
  }
  render() {
    return (
    <Fragment>
      <Form getWeather={this.getWeather}/>
    </Fragment>
    )
  }
}

export default App
/*
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount() {
    fetch("https://api.example.com/items")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.items
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <ul>
          {items.map(item => (
            <li key={item.name}>
              {item.name} {item.price}
            </li>
          ))}
        </ul>
      );
    }
  }
}
*/
