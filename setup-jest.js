import { jest } from '@jest/globals'
import React from 'react'

global.React = React
global.jest = jest

// Supress Warning: The current testing environment is not configured to support act(...)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
