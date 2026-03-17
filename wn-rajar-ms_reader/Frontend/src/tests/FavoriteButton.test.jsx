import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FavoriteButton from '../components/FavoriteButton/FavoriteButton';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ));
});

describe('FavoriteButton', () => {
  test('affiche le bouton avec le bon aria-label par défaut', async () => {
    render(<FavoriteButton articleId={1} />);
    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Ajouter aux favoris');
  });

  test('affiche le label quand showLabel est true', async () => {
    render(<FavoriteButton articleId={1} showLabel={true} />);
    expect(await screen.findByText('Ajouter aux favoris')).toBeInTheDocument();
  });

  test("n'affiche pas le label quand showLabel est false", async () => {
    render(<FavoriteButton articleId={1} showLabel={false} />);
    await screen.findByRole('button');
    expect(screen.queryByText('Ajouter aux favoris')).not.toBeInTheDocument();
  });
});