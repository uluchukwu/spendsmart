import TransactionItem from './TransactionItem.jsx';
import Spinner from '../common/Spinner.jsx';
import styles from '../../styles/TransactionList.module.css';

/**
 * @param {{
 *   transactions: Array,
 *   loading: boolean,
 *   total: number,
 *   pages: number,
 *   currentPage: number,
 *   onPageChange: (page: number) => void,
 *   onEdit: (t: object) => void,
 *   onDelete: (id: string) => void
 * }} props
 */
export default function TransactionList({
  transactions, loading, total, pages, currentPage,
  onPageChange, onEdit, onDelete,
}) {
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner />
        <p>Loading transactions…</p>
      </div>
    );
  }

  if (!loading && transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔍</span>
        <p className={styles.emptyTitle}>No transactions found</p>
        <p className={styles.emptyHint}>Try adjusting your filters or add a new transaction.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <span>{total} transaction{total !== 1 ? 's' : ''}</span>
      </div>

      <ul className={styles.list}>
        {transactions.map(t => (
          <TransactionItem key={t._id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>

      {pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…'
                  ? <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                  : (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${p === currentPage ? styles.activePage : ''}`}
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </button>
                  )
              )
            }
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
