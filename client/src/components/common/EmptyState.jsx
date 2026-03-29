export default function EmptyState({ icon = '📭', message = 'Nothing here yet', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
      {action && action}
    </div>
  );
}
