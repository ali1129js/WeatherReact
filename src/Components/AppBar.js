/**
 * @Author: Ali
 * @Date:   2018-05-08T21:01:10+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-12T19:51:07+02:00
 */
 import React, {Component} from 'react'

 import PropTypes from 'prop-types'
 class weatherBar extends Component {
   static propTypes = {
     newCity:PropTypes.shape({value: PropTypes.instanceOf(HTMLInputElement)})
   }
  constructor(props) {
  super(props)
  this.state = { modalIsOpen: false }
  this.openModal = this.openModal.bind(this)
  this.afterOpenModal = this.afterOpenModal.bind(this)
  this.closeModal = this.closeModal.bind(this)
  }
openModal() {
  this.setState({modalIsOpen: true})
}

afterOpenModal() {
  console.log("after")
}

closeModal() {
  this.setState({modalIsOpen: false})
}
  render(){
    return (
      <div className="container">
        <nav className="navbar sticky-top navbar-dark bg-dark">
          <a className="navbar-brand" href="http://openweathermap.org" target='_blanck'>Find Weather</a><br />
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
            <button
              className="btn btn-outline-info"
              type="submit"
              onClick={this.openModal}
            >
            Search</button>
          </form>
        </nav>
      </div>
    )
  }
 }

export default weatherBar
