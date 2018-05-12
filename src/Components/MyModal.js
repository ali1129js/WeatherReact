/**
 * @Author: Ali
 * @Date:   2018-05-12T13:41:19+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-12T20:53:17+02:00
 */
import React,{Component} from 'react'
import styled from 'styled-components'
const Content = styled.div`
  background: linear-gradient(to bottom right, #3498db ,papayawhip, #f39c12);
  margin: auto;
  margin-top: 1em;
  height: 12em;
  width: 12em;
  font-size: 1.2em;
  text-align: center;
  border: 3px solid #fab1a0;
  padding: 5px;
  padding-top: 10px;
  box-shadow: 8px 10px #7f8c8d;
`
class MyModal extends Component {
  render(){
    if(!this.props.show) {
      return null;
    }
    return(

            <div className="modal-body">
              <Content>
                { this.props.city && this.props.country && <p>{ this.props.city},<b>{this.props.country} </b> </p> }
                { this.props.description && <p><i><b> {this.props.description}</b></i></p>}
                { this.props.temperature && <p> Temperature: <strong>{this.props.temperature}</strong>°C </p>}
                { this.props.humidity && <p> Humidity: <b>  {this.props.humidity} </b> </p>}
                { this.props.error && <p> {this.props.error} </p>}
              </Content>
            </div>
    )

  }
}
export default MyModal
