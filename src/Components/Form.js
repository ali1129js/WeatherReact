/**
 * @Author: Ali
 * @Date:   2018-05-05T19:00:54+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-10T19:15:45+02:00
 */
import React from 'react'

const Form = props => (
  <form  className="input-group" onSubmit={props.getWeather}>
    <input
      className="form-control"
      type="text"
      name="city"
      placeholder="city"
    />
    <input
      className="form-control"
      type="text"
      name="country"
      placeholder="country"
    />
    <button className="btn btn-info"> Get Weather </button>
  </form>
)
export default Form
