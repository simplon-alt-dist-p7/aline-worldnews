import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Modal from '../components/Modal/Modal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Titre test',
  message: 'Message test',
  type: 'info' as const,
};

describe('Modal', () => {
  test("n'affiche rien quand isOpen est false", () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('affiche le titre et le message quand isOpen est true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Titre test')).toBeInTheDocument();
    expect(screen.getByText('Message test')).toBeInTheDocument();
  });

  test('affiche le bouton Compris', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Compris')).toBeInTheDocument();
  });

  test('affiche le bouton Annuler', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });
});
