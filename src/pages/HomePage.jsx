import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

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
    <div className="card">
      <h1>메모 입력</h1>
      <form onSubmit={handleSave} className="form">
        <label className="label">학생명</label>
        {students.length === 0 ? (
          <p className="hint">설정에서 학생을 추가하세요.</p>
        ) : (
          <select className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)}>
            {students.map((student) => (
              <option key={student.id} value={student.name}>
                {student.name}
              </option>
            ))}
          </select>
        )}

        <label className="label">내용</label>
        <textarea
          className="input textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          placeholder="내용 입력"
        />

        <button className="btn" type="submit" disabled={loading || students.length === 0}>
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
      {message ? <p className="hint">{message}</p> : null}
    </div>
  );
}
