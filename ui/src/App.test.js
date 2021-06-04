import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux'
import App from './App';
import store from './store';

test('renders extract schema button', () => {
  render(<Provider store={store}><App /></Provider>);
  const buttonElement = screen.getByText(/extract schema/i);
  expect(buttonElement).toBeInTheDocument();
});
