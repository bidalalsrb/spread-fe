import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { getToken, setToken } from '../auth';

export default function AuthPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { Authorization: '' },
        body: JSON.stringify({ code })
      });
      setToken(data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError('접속 불가');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>인증</h1>
      <p className="hint">전화번호 코드를 입력하세요.</p>
      <form onSubmit={handleSubmit} className="form">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="인증 코드"
          className="input"
          autoComplete="off"
        />
        <button type="submit" className="btn" disabled={loading || !code.trim()}>
          {loading ? '확인 중...' : '확인'}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
