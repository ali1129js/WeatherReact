/**
 * @Author: Ali
 * @Date:   2018-05-05T19:00:54+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-09T13:32:14+02:00
 */
import React,{Component} from 'react'

const Form = props => (
  <form onSubmit={props.getWeather}>
    <input type="text" name="city" placeholder="city" />
    <input type="text" name="country" placeholder="country" />
    <button> Get Weather </button>
  </form>
)
export default Form
