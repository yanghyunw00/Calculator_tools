import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #e0e0e0',
      padding: '16px 24px',
      textAlign: 'center',
      fontSize: 13,
      color: '#888',
    }}>
      <Link to="/privacy" style={{ color: '#888', textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = '#16a34a'}
        onMouseLeave={e => e.target.style.color = '#888'}>
        개인정보처리방침
      </Link>
      <span style={{ margin: '0 8px' }}>·</span>
      <span>© {new Date().getFullYear()} MathCalc</span>
    </footer>
  );
}
