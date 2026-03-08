import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

const HOME_SECTIONS = [
  { key: 'OBSERVATION', title: '관찰' },
  { key: 'COUNSELING', title: '상담' },
  { key: 'PLAY_LOG', title: '놀이기록' }
];

const createInitialSectionState = () =>
  HOME_SECTIONS.reduce((acc, section) => {
    acc[section.key] = { content: '', message: '', loading: false };
    return acc;
  }, {});

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [sections, setSections] = useState(createInitialSectionState);
  const [loadError, setLoadError] = useState('');
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
      setLoadError(err.message);
    }
  };

  const updateSectionState = (sectionKey, patch) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        ...patch
      }
    }));
  };

  const handleSave = async (sectionKey) => {
    if (!studentName) {
      updateSectionState(sectionKey, { message: '학생을 선택하세요.' });
      return;
    }

    const section = sections[sectionKey];
    if (!section.content.trim()) {
      updateSectionState(sectionKey, { message: '내용은 필수입니다.' });
      return;
    }

    updateSectionState(sectionKey, { loading: true, message: '' });

    try {
      const data = await apiFetch(
        '/api/memos',
        {
          method: 'POST',
          body: JSON.stringify({
            category: sectionKey,
            studentName,
            content: section.content
          })
        },
        onUnauthorized
      );
      updateSectionState(sectionKey, { content: '', message: `저장 완료 (${data.savedAt})` });
    } catch (err) {
      updateSectionState(sectionKey, { message: err.message });
    } finally {
      updateSectionState(sectionKey, { loading: false });
    }
  };

  return (
    <div className="space-y-4">
      {HOME_SECTIONS.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <CardTitle className="text-xl">{section.title}</CardTitle>
            <CardDescription>학생을 선택하고 {section.title} 내용을 저장하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                value={sections[section.key].content}
                onChange={(e) => updateSectionState(section.key, { content: e.target.value })}
                maxLength={2000}
                placeholder={`${section.title} 내용 입력`}
              />
            </div>

            <Button
              className="w-full"
              type="button"
              onClick={() => handleSave(section.key)}
              disabled={sections[section.key].loading || students.length === 0}
            >
              {sections[section.key].loading ? '저장 중...' : `${section.title} 저장`}
            </Button>

            {sections[section.key].message ? (
              <p className="text-sm text-muted-foreground">{sections[section.key].message}</p>
            ) : null}
            {loadError ? <p className="text-sm text-muted-foreground">{loadError}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
