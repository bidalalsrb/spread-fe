import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ABSENCE_DRAFT_KEY = 'absenceDraft';

function todayKey() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function mergeRows(localRows, serverItems, date) {
  const byStudent = new Map();

  for (const item of serverItems) {
    byStudent.set(item.studentName, {
      id: `server-${item.studentName}`,
      studentName: item.studentName,
      note: item.note,
      createdAt: item.date || date,
      submitted: true
    });
  }

  for (const row of localRows) {
    if (!byStudent.has(row.studentName)) {
      byStudent.set(row.studentName, row);
    }
  }

  return Array.from(byStudent.values());
}

export default function AbsencePage() {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [note, setNote] = useState('');
  const [rows, setRows] = useState([]);
  const [activeDate, setActiveDate] = useState(todayKey());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onUnauthorized = () => navigate('/auth', { replace: true });

  useEffect(() => {
    loadStudents();
    hydrateRows();
    loadTodayAbsences();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ABSENCE_DRAFT_KEY,
      JSON.stringify({
        date: activeDate,
        rows
      })
    );
  }, [activeDate, rows]);

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

  const hydrateRows = () => {
    const raw = localStorage.getItem(ABSENCE_DRAFT_KEY);
    const today = todayKey();
    if (!raw) {
      setActiveDate(today);
      setRows([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.date === today && Array.isArray(parsed?.rows)) {
        setActiveDate(today);
        setRows(parsed.rows);
      } else {
        setActiveDate(today);
        setRows([]);
      }
    } catch {
      setActiveDate(today);
      setRows([]);
    }
  };

  const loadTodayAbsences = async () => {
    try {
      const data = await apiFetch('/api/absences/today', {}, onUnauthorized);
      const date = data.date || todayKey();
      setActiveDate(date);
      setRows((prev) => mergeRows(prev, data.items || [], date));
    } catch (err) {
      setMessage(err.message);
    }
  };

  const ensureTodayState = () => {
    const today = todayKey();
    if (today !== activeDate) {
      setActiveDate(today);
      setRows([]);
      return { today, reset: true };
    }
    return { today, reset: false };
  };

  const handleWrite = () => {
    const { today } = ensureTodayState();

    if (!studentName) {
      setMessage('학생을 선택하세요.');
      return;
    }
    if (!note.trim()) {
      setMessage('비고를 입력하세요.');
      return;
    }

    const alreadyExists = rows.some((row) => row.studentName === studentName);
    if (alreadyExists) {
      setMessage('해당 학생은 오늘 이미 추가되었습니다.');
      return;
    }

    const next = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      studentName,
      note: note.trim(),
      createdAt: today,
      submitted: false
    };

    setRows((prev) => [next, ...prev]);
    setNote('');
    setMessage('목록에 추가되었습니다.');
  };

  const handleSubmit = async () => {
    const { reset } = ensureTodayState();
    if (reset) {
      setMessage('날짜가 변경되어 목록이 초기화되었습니다.');
      return;
    }

    const pendingRows = rows.filter((row) => !row.submitted);
    if (pendingRows.length === 0) {
      setMessage('제출할 항목이 없습니다.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await apiFetch(
        '/api/absences/submit',
        {
          method: 'POST',
          body: JSON.stringify({
            items: pendingRows.map((row) => ({
              studentName: row.studentName,
              note: row.note
            }))
          })
        },
        onUnauthorized
      );

      await loadTodayAbsences();
      setMessage(`결석 항목 제출 완료 (신규 ${pendingRows.length}명)`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">결석</CardTitle>
        <CardDescription>이름과 비고를 작성해 목록에 쌓은 뒤 제출하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          {students.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted px-3 py-2 text-sm text-muted-foreground sm:col-span-3">
              설정에서 학생을 추가하세요.
            </p>
          ) : (
            <>
              <Select value={studentName} onValueChange={setStudentName}>
                <SelectTrigger>
                  <SelectValue placeholder="이름 선택" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.name}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder="비고" />

              <Button type="button" onClick={handleWrite} disabled={students.length === 0}>
                작성
              </Button>
            </>
          )}
        </div>

        <div className="overflow-hidden rounded-md border">
          <div className="grid grid-cols-[1fr_2fr_1.4fr] bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
            <span>이름</span>
            <span>비고</span>
            <span>일시</span>
          </div>
          {rows.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">작성된 항목이 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {rows.map((row) => (
                <li key={row.id} className="grid grid-cols-[1fr_2fr_1.4fr] px-3 py-2 text-sm">
                  <span>{row.studentName}</span>
                  <span className="break-all">{row.note}</span>
                  <span>{row.createdAt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button className="w-full" type="button" onClick={handleSubmit} disabled={loading || rows.length === 0}>
          {loading ? '제출 중...' : '제출'}
        </Button>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
