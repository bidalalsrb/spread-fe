import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const onUnauthorized = () => navigate('/auth', { replace: true });

  const loadStudents = async () => {
    try {
      const data = await apiFetch('/api/students', {}, onUnauthorized);
      setStudents(data.items || []);
      if (!studentName && data.items?.length > 0) {
        setStudentName(data.items[0].name);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!studentName) {
      setMessage('학생을 선택하세요.');
      return;
    }
    if (!content.trim()) {
      setMessage('내용은 필수입니다.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = await apiFetch(
        '/api/memos',
        {
          method: 'POST',
          body: JSON.stringify({ studentName, content })
        },
        onUnauthorized
      );
      setContent('');
      setMessage(`저장 완료 (${data.savedAt})`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">메모 입력</CardTitle>
        <CardDescription>학생을 선택하고 내용을 저장하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">학생명</label>
            {students.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                설정에서 학생을 추가하세요.
              </p>
            ) : (
              <Select value={studentName} onValueChange={setStudentName}>
                <SelectTrigger>
                  <SelectValue placeholder="학생 선택" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.name}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">내용</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              placeholder="내용 입력"
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading || students.length === 0}>
            {loading ? '저장 중...' : '저장'}
          </Button>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
