/**
 * @Author: Ali
 * @Date:   2018-05-08T21:01:10+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-12T13:27:41+02:00
 */
 import React, {Component} from 'react'
 import PropTypes from 'prop-types'
 class weatherBar extends Component {
   static propTypes = {
     newCity:PropTypes.shape({value: PropTypes.instanceOf(HTMLInputElement)})
   }

  render(){
    return (
      <div className="container">
        <nav className="navbar sticky-top navbar-dark bg-dark">
          <a className="navbar-brand" href="#">Find Weather</a>
          <form className="form-inline" onSubmit={this.props.getWeather}>
            <input
              className="form-control"
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
            <button className="btn btn-outline-info" type="submit">Search</button>
          </form>
        </nav>
      </div>
    )
  }
 }

export default weatherBar
