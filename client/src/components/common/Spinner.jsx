export default function Spinner({ size = 'md', style = {} }) {
  const cls = size === 'sm' ? 'spinner spinner-sm' : 'spinner';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', ...style }}>
      <div className={cls} />
    </div>
  );
}
