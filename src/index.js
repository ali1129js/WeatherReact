/**
 * @Author: Ali
 * @Date:   2018-05-05T17:04:27+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-10T19:10:15+02:00
 */
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './bootstrap.min.css'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
