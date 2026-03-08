import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { apiFetch } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

export default function SettingsPage() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState('');
  const [editStudentId, setEditStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editing, setEditing] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
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

  const openEditModal = (student) => {
    setEditStudentId(student.id);
    setEditStudentName(student.name);
  };

  const closeEditModal = (force = false) => {
    if (editing && !force) {
      return;
    }
    setEditStudentId(null);
    setEditStudentName('');
  };

  const updateStudent = async () => {
    if (!editStudentId) {
      return;
    }
    if (!editStudentName.trim()) {
      setMessage('학생 이름을 입력하세요.');
      return;
    }
    try {
      setEditing(true);
      await apiFetch(
        `/api/students/${editStudentId}`,
        { method: 'PUT', body: JSON.stringify({ name: editStudentName }) },
        onUnauthorized
      );
      setMessage('학생 이름 수정 완료');
      closeEditModal(true);
      loadAll();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setEditing(false);
    }
  };

  const testConnection = async () => {
    try {
      await apiFetch('/api/settings/test', { method: 'POST' }, onUnauthorized);
      setMessage('시트 연결 성공');
    } catch (err) {
      setMessage(`연결 실패: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">학생 목록 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              placeholder="학생 이름"
              className="flex-1"
            />
            <Button type="button" onClick={addStudent}>
              추가
            </Button>
          </div>

          <ul className="divide-y rounded-md border bg-card">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium">{s.name}</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => openEditModal(s)}>
                    수정
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => deleteStudent(s.id)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> 삭제
                  </Button>
                </div>
              </li>
            ))}
            {students.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">등록된 학생이 없습니다.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">스프레드시트 연결 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground break-all">
            고정 주소: {spreadsheetId || '설정되지 않음'}
          </p>
          <Button type="button" onClick={testConnection} className="w-full">
            시트 연결 테스트
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      {editStudentId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg">
            <h3 className="text-base font-semibold">학생 이름 수정</h3>
            <div className="mt-3 space-y-3">
              <Input value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} placeholder="학생 이름" />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeEditModal} disabled={editing}>
                  취소
                </Button>
                <Button type="button" onClick={updateStudent} disabled={editing}>
                  {editing ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
