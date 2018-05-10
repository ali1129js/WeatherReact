/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-10T16:59:52+02:00
 */
import React from 'react'
import styled from 'styled-components'
const Content = styled.div`
  background: papayawhip;
  height: 30em;
  width: 30em;`
const Weather = props => (
  <Content>
    { props.city && props.country && <p> Location:
      { props.city},{ props.country} </p> }
    { props.temperature && <p> Temperature:  {props.temperature} </p>}
    { props.humidity && <p> Humidity:{props.humidity} </p>}
    { props.description && <p> Condition:{props.description} </p>}
    { props.error && <p> {props.error} </p>}
  </Content>
)

export default Weather
