import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../ArticleCard/ArticleCard';
import useIsMobile from '../../hooks/useIsMobile';
import './ArticleList.css';

const API_URL = import.meta.env.VITE_API_URL;

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  // Catégories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const isMobile = useIsMobile();

  // Infinite scroll
  const observer = useRef(null);
  const lastArticleRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && isMobile) {
          setCurrentPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, isMobile],
  );

  const fetchArticles = useCallback(
    async (pageToFetch, append = false) => {
      try {
        setLoading(true);
        setError(null);

        let url = `${API_URL}/articles?page=${pageToFetch}&limit=${limit}`;
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Impossible de récupérer les articles');

        const data = await res.json();

        const newArticles = data.articles ?? [];

        if (append && isMobile) {
          setArticles((prev) => [...prev, ...newArticles]);
        } else {
          setArticles(newArticles);
        }

        setTotalPages(data.pagination?.totalPages ?? 1);
        setHasMore(pageToFetch < (data.pagination?.totalPages ?? 1));

        if (categories.length === 0 && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [limit, selectedCategory, isMobile, categories.length],
  );

  // Charger articles quand page change
  useEffect(() => {
    const append = isMobile && currentPage > 1;
    fetchArticles(currentPage, append);
  }, [currentPage, fetchArticles, isMobile]);

  // Réinitialiser quand filtre ou limit change
  useEffect(() => {
    setCurrentPage(1);
    setArticles([]);
    fetchArticles(1, false);
  }, [limit, selectedCategory, fetchArticles]);

  const handleLimitClick = (newLimit) => {
    setLimit(newLimit);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  if (error) {
    return (
      <div className="empty-state">
        <p className="empty-state__icon">😕</p>
        <p className="empty-state__message">Oups ! Une erreur est survenue</p>
        <p className="empty-state__detail">{error}</p>
      </div>
    );
  }

  if (loading && articles.length === 0) {
    return <p className="loading">Chargement des articles...</p>;
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__icon">📰</p>
        <p className="empty-state__message">Aucun article disponible pour le moment</p>
        <p className="empty-state__detail">
          Revenez bientôt pour découvrir nos dernières actualités !
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Contrôles desktop */}
      {!isMobile && (
        <div className="pagination-controls">
          <span className="toggle-label">Articles par page :</span>
          <div className="toggle-container">
            <button
              className={`toggle-button ${limit === 5 ? 'active' : ''}`}
              onClick={() => handleLimitClick(5)}
            >
              5
            </button>
            <button
              className={`toggle-button ${limit === 10 ? 'active' : ''}`}
              onClick={() => handleLimitClick(10)}
            >
              10
            </button>
          </div>

          <div className="control-category">
            <label htmlFor="category-select">Articles par catégorie :</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="limit-select"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.title}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filtre mobile */}
      {isMobile && (
        <div className="mobile-category-filter">
          <select
            id="category-select-mobile"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mobile-select"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Grille d'articles */}
      <section className="articles-grid">
        {articles.map((article, index) => {
          const isLast = isMobile && index === articles.length - 1;
          return (
            <Link
              ref={isLast ? lastArticleRef : null}
              key={article.id}
              to={`/${article.id}`}
              className="article-card-link"
            >
              <ArticleCard article={article} />
            </Link>
          );
        })}
      </section>

      {/* Infinite scroll */}
      {isMobile && loading && <p className="loading">Chargement de plus d'articles...</p>}
      {isMobile && !hasMore && <p className="end-message">Vous avez vu tous les articles ! 🎉</p>}

      {/* Pagination desktop */}
      {!isMobile && (
        <div className="pagination">
          <button onClick={goToPrevious} disabled={currentPage === 1} className="pagination-button">
            ← Précédent
          </button>
          <span className="pagination-info">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

export default ArticleList;
