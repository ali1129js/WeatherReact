/**
 * @Author: Ali
 * @Date:   2018-05-08T21:01:10+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-12T22:18:03+02:00
 */
 import React, {Component} from 'react'
 //import cities from './cities.json'
 import PropTypes from 'prop-types'

 class weatherBar extends Component {
   static propTypes = {
     newCity:PropTypes.shape({value: PropTypes.instanceOf(HTMLInputElement)}),
      newCountry:PropTypes.shape({value: PropTypes.instanceOf(HTMLInputElement)})
   }
   constructor(){
     super()
     this.state = {
       search: '',
    }
     this.handleChange = this.handleChange.bind(this)
   }
   handleChange(e) {
     const search = e.target.value;
     this.setState({search: search});
   }
  render(){
    return (
      <div className="container">
        <nav className="navbar sticky-top navbar-dark bg-dark">
          <a className="navbar-brand" href="http://openweathermap.org" target='_blanck'>Find Weather</a><br />
          <br />
          <form className="form-inline" onSubmit={this.props.getWeather}>
            <input
              className="form-control"
              value={this.state.search}
              onChange={this.handleChange}
              type="search"
              placeholder="City"
              aria-label="Search"
              ref={this.props.newCity }
            />
            <input
              className="form-control"
              type="search"
              placeholder="Country"
              aria-label="Search"
              ref={this.props.newCountry}
            />
            <button
              className="btn btn-outline-info"
              type="submit"
              onClick={this.props.openModal}
            >
            Search</button>
          </form>
        </nav>
      </div>
    )
  }
 }

export default weatherBar
