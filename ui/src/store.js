import { configureStore } from '@reduxjs/toolkit'
import schemaReducer from './features/schemaSlice';

export default configureStore({
  reducer: {
    schema: schemaReducer,
  },
})
