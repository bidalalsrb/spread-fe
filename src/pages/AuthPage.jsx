import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { getToken, setToken } from '../auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

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
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">인증</CardTitle>
          <CardDescription>전화번호 코드를 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="인증 코드" autoComplete="off" />
            <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
              {loading ? '확인 중...' : '확인'}
            </Button>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
