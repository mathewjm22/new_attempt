import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders the initial page with header and placeholder', () => {
  render(<App />);

  // Check for the main title
  const titleElement = screen.getByText(/Differential Diagnosis Trainer/i);
  expect(titleElement).toBeInTheDocument();

  // Check for the initial placeholder text
  const placeholderElement = screen.getByText(/Please select a specialty to begin a case./i);
  expect(placeholderElement).toBeInTheDocument();
});

test('loads and displays a case when a specialty is selected', () => {
  render(<App />);

  // Select a specialty from the dropdown
  const selectElement = screen.getByRole('combobox');
  fireEvent.change(selectElement, { target: { value: 'Renal, Urinary, Male Reproductive Systems' } });

  // Check that the case title is now visible
  const caseTitle = screen.getByText(/A 61-Year-Old Man with Kidney Transplant and Shock/i);
  expect(caseTitle).toBeInTheDocument();

  // Check that the first part of the case is visible
  const firstPart = screen.getByText(/A 61-year-old man was transferred to this hospital/i);
  expect(firstPart).toBeInTheDocument();

  // Check that the differential diagnosis panel is visible by looking for its specific heading
  const differentialTitle = screen.getByRole('heading', { name: /Differential Diagnosis/i, level: 2 });
  expect(differentialTitle).toBeInTheDocument();
});
