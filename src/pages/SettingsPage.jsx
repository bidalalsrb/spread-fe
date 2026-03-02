import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function SettingsPage() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('메모기록');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const onUnauthorized = () => navigate('/auth', { replace: true });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [studentRes, settingsRes] = await Promise.all([
        apiFetch('/api/students', {}, onUnauthorized),
        apiFetch('/api/settings', {}, onUnauthorized)
      ]);
      setStudents(studentRes.items || []);
      setSpreadsheetId(settingsRes.spreadsheetId || '');
      setSheetName(settingsRes.sheetName || '메모기록');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const addStudent = async () => {
    if (!newStudent.trim()) {
      return;
    }
    try {
      await apiFetch(
        '/api/students',
        { method: 'POST', body: JSON.stringify({ name: newStudent }) },
        onUnauthorized
      );
      setNewStudent('');
      setMessage('학생 추가 완료');
      loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await apiFetch(`/api/students/${id}`, { method: 'DELETE' }, onUnauthorized);
      setMessage('학생 삭제 완료');
      loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const saveSettings = async () => {
    try {
      await persistSettings();
      setMessage('설정 저장 완료');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const persistSettings = async () => {
    await apiFetch(
      '/api/settings',
      {
        method: 'PUT',
        body: JSON.stringify({ spreadsheetId, sheetName })
      },
      onUnauthorized
    );
  };

  const testConnection = async () => {
    try {
      await persistSettings();
      await apiFetch('/api/settings/test', { method: 'POST' }, onUnauthorized);
      setMessage('시트 연결 성공');
      await loadAll();
    } catch (err) {
      setMessage(`연결 실패: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <h1>설정</h1>

      <section className="section">
        <h2>학생 목록 관리</h2>
        <div className="row">
          <input
            className="input"
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
            placeholder="학생 이름"
          />
          <button type="button" className="btn small" onClick={addStudent}>
            추가
          </button>
        </div>
        <ul className="list">
          {students.map((s) => (
            <li key={s.id} className="list-item">
              <span>{s.name}</span>
              <button type="button" className="danger" onClick={() => deleteStudent(s.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>스프레드시트 설정</h2>
        <label className="label">Spreadsheet URL 또는 ID</label>
        <input
          className="input"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/..."
        />
        <label className="label">Sheet 탭 이름</label>
        <input className="input" value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
        <button type="button" className="btn" onClick={saveSettings}>
          저장
        </button>
      </section>

      <section className="section">
        <h2>연결 테스트</h2>
        <button type="button" className="btn" onClick={testConnection}>
          시트 연결 테스트
        </button>
      </section>

      {message ? <p className="hint">{message}</p> : null}
    </div>
  );
}
