import { createSlice } from '@reduxjs/toolkit'

export const schemaSlice = createSlice({
  name: 'schema',
  initialState: {
    schema: null
  },
  reducers: {
    setSchema: (state, action) => {
      state.schema = action.payload;
    }
  },
})

export const { setSchema } = schemaSlice.actions;

export default schemaSlice.reducer;
