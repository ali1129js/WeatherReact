/**
 * @Author: Ali
 * @Date:   2018-05-05T19:00:54+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-05T19:06:46+02:00
 */
import React,{Component} from 'react'
class Form extends Component {
  render(){
    return (
      <form onSubmit={this.props.getWeather}>
        <input type="text" name="city" placeholder="city" />
        <input type="text" name="country" placeholder="country" />
        <button> Get Weather </button>
      </form>
    )
  }
}
export default Form
