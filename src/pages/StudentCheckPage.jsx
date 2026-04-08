import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

const STUDENT_CHECK_DRAFT_KEY = 'studentCheckDraft';

function readStoredCheckedMap() {
  const raw = localStorage.getItem(STUDENT_CHECK_DRAFT_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    // Backward compatibility for old shape: { date, checkedMap }
    if (parsed?.checkedMap && typeof parsed.checkedMap === 'object') {
      return parsed.checkedMap;
    }

    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    return {};
  }

  return {};
}

export default function StudentCheckPage() {
  const [students, setStudents] = useState([]);
  const [checkedMap, setCheckedMap] = useState(readStoredCheckedMap);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const onUnauthorized = () => navigate('/auth', { replace: true });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    localStorage.setItem(STUDENT_CHECK_DRAFT_KEY, JSON.stringify(checkedMap));
  }, [checkedMap]);

  const loadStudents = async () => {
    setMessage('');
    try {
      const data = await apiFetch('/api/students', {}, onUnauthorized);
      setStudents(data.items || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const toggleChecked = (studentName) => {
    setCheckedMap((prev) => ({
      ...prev,
      [studentName]: !prev[studentName]
    }));
  };

  const handleReset = () => {
    setCheckedMap({});
    setMessage('체크 상태를 초기화했습니다.');
  };

  const checkedCount = useMemo(
    () => students.filter((student) => checkedMap[student.name]).length,
    [students, checkedMap]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">학생 체크</CardTitle>
        <CardDescription>학생을 눌러 체크 상태를 표시하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            등록된 학생이 없습니다. 설정에서 학생을 추가하세요.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {students.map((student) => {
              const checked = Boolean(checkedMap[student.name]);

              return (
                <Button
                  key={student.id}
                  type="button"
                  variant={checked ? 'default' : 'secondary'}
                  className={cn('h-12 w-full px-2 text-sm', checked && 'ring-2 ring-primary/60')}
                  onClick={() => toggleChecked(student.name)}
                >
                  {checked ? `✓ ${student.name}` : student.name}
                </Button>
              );
            })}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          체크됨: {checkedCount} / 전체: {students.length}
        </p>

        <Button type="button" variant="secondary" onClick={handleReset} disabled={students.length === 0}>
          초기화
        </Button>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
