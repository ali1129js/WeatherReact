/**
 * @Author: Ali
 * @Date:   2018-05-05T17:04:42+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-09T12:51:46+02:00
 */
import React, { Component } from 'react'
import Form from './Components/Form'
import Weather from './Components/Weather'
import AppBar from './Components/AppBar'
import {MuiThemeProvider} from 'material-ui/styles'
import Paper from 'material-ui/Paper'

const API_KEY = '32941f4c12936fc51133cb69ca8f8b8a'

class App extends Component {
  constructor(){
    super()
    this.state = {
      temperature: undefined,
      city: undefined,
      country: undefined,
      humidity: undefined,
      description: undefined,
      error: undefined
    }
  }
  getWeather = async (e) => {
    e.preventDefault()
    const city = e.target.elements.city.value
    const country = e.target.elements.country.value
    const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`)
    const data = await api_call.json()
    console.log(data)
    this.setState({
      temperature: data.main.temp,
      city: data.name,
      country: data.sys.country,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      error: ''
    })
  }
  render() {
    return (
      <MuiThemeProvider>
        <Paper>
          <AppBar />
          <br />
          <Form getWeather={this.getWeather}/>
          <Weather
            temperature={this.state.temperature}
            humidity={this.state.humidity}
            city={this.state.city}
            country={this.state.country}
            description={this.state.description}
            error={this.state.error}
          />
        </Paper>
      </MuiThemeProvider>
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

city = e.target.elemnets/city.value
http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=API_ALI
*/
