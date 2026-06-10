export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', color: '#222' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>개인정보처리방침</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 32 }}>최종 수정일: 2025년 6월 10일</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>1. 운영자 정보</h2>
        <p style={p}>
          서비스명: MathCalc<br />
          운영자 이메일: jtpgns2015@gmail.com
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>2. 수집하는 개인정보</h2>
        <p style={p}>
          본 사이트(MathCalc)는 회원가입, 로그인 등의 기능이 없으며 별도의 개인정보를 직접 수집하지 않습니다.
          단, 아래 제3자 서비스가 자동으로 일부 정보를 수집할 수 있습니다.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>3. 제3자 광고 서비스 (Google AdSense)</h2>
        <p style={p}>
          본 사이트는 Google LLC가 제공하는 Google AdSense 광고 서비스를 사용합니다.
          Google은 쿠키(Cookie)를 사용하여 사용자의 관심사에 맞는 광고를 표시할 수 있습니다.
        </p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, fontSize: 14, color: '#444' }}>
          <li>Google은 방문 기록, 브라우저 정보 등을 수집할 수 있습니다.</li>
          <li>사용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>Google 광고 설정</a>에서 맞춤 광고를 비활성화할 수 있습니다.</li>
          <li>Google의 개인정보 처리 방식은 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>Google 개인정보처리방침</a>을 참고하세요.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>4. 쿠키(Cookie) 사용</h2>
        <p style={p}>
          본 사이트는 자체적으로 쿠키를 생성·저장하지 않습니다.
          다만 Google AdSense 등 제3자 서비스가 쿠키를 사용할 수 있으며,
          브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>5. 개인정보의 보유 및 이용기간</h2>
        <p style={p}>
          본 사이트는 직접 개인정보를 보유하지 않습니다.
          Google 등 제3자 서비스의 데이터 보유 기간은 각 서비스의 개인정보처리방침을 따릅니다.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>6. 정보주체의 권리</h2>
        <p style={p}>
          개인정보와 관련한 문의, 열람·정정·삭제 요청은 아래 이메일로 연락해 주세요.
        </p>
        <p style={{ ...p, marginTop: 8 }}>
          <strong>이메일:</strong>{' '}
          <a href="mailto:jtpgns2015@gmail.com" style={{ color: '#16a34a' }}>jtpgns2015@gmail.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2}>7. 방침 변경</h2>
        <p style={p}>
          본 개인정보처리방침은 법령 또는 서비스 변경에 따라 업데이트될 수 있으며,
          변경 시 본 페이지에 공지됩니다.
        </p>
      </section>
    </div>
  );
}

const h2 = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 10,
  color: '#111',
};

const p = {
  fontSize: 14,
  lineHeight: 1.9,
  color: '#444',
  margin: 0,
};
