import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, BookOpen, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAllQuizzes, modulesData } from '../data/modules';
import { getProgress } from '../utils/progress';
import { playSuccessSound, playFailSound } from '../utils/sound';

export default function Quiz({ user }) {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const found = getAllQuizzes().find(q => q.id === quizId);
    
    if (found) {
      // Enforce locking security
      const parentModule = modulesData.find(m => m.quizzes.includes(quizId));
      if (parentModule) {
        const quizIndex = parentModule.quizzes.indexOf(quizId);
        const progress = getProgress(user?.uid);
        const isLocked = quizIndex > 0 && !progress[parentModule.quizzes[quizIndex - 1]]?.passed;
        
        if (isLocked) {
          alert('This quiz is locked! You must pass the previous learning outcome first.');
          navigate(`/module/${parentModule.id}`);
          return;
        }
      }

      setQuiz(found); 
      setCurrentIndex(0); 
      setScore(0); 
      setSelectedOption(null); 
    } else {
      navigate('/dashboard');
    }
    return () => clearTimeout(timerRef.current);
  }, [quizId, navigate, user]);

  if (!quiz) return (
    <div className="quiz-loading">
      <div className="spinner" /><p>Loading quiz...</p>
    </div>
  );

  const q = quiz?.questions && currentIndex < quiz.questions.length ? quiz.questions[currentIndex] : null;
  const isAnswered = selectedOption !== null;
  const isLast = quiz ? currentIndex >= quiz.questions.length - 1 : true;
  const progress = quiz ? ((currentIndex + (isAnswered ? 1 : 0)) / quiz.questions.length) * 100 : 0;
  const isCorrect = q && selectedOption === q.correctAnswer;

  // Identify parent module for image category mapping
  const parentModule = quiz ? modulesData.find(m => m.quizzes.includes(quiz.id)) : null;
  const moduleId = parentModule ? parentModule.id : 'module-database';

  const getModuleImage = (modId, index) => {
    const images = {
      'module-hardware': [
        'photo-1591799264318-7e6ef8ddb7ea',
        'photo-1518770660439-4636190af475',
        'photo-1555664424-778a1e5e1b48',
        'photo-1581092335397-9583fe92d232',
        'photo-1548345680-f5475ea5df84'
      ],
      'module-network': [
        'photo-1544197150-b99a580bb7a8',
        'photo-1562408590-e32931084e23',
        'photo-1451187580459-43490279c0fa',
        'photo-1550751827-4bd374c3f58b',
        'photo-1544383835-bda2bc66a55d'
      ],
      'module-software': [
        'photo-1531403009284-440f080d1e12',
        'photo-1507238691740-187a5b1d37b8',
        'photo-1498050108023-c5249f4df085',
        'photo-1581291518633-83b4ebd1d83e',
        'photo-1555066931-4365d14bab8c'
      ],
      'module-oop': [
        'photo-1618005182384-a83a8bd57fbe',
        'photo-1605647540924-852290f6b0d5',
        'photo-1586075010923-2dd4570fb338',
        'photo-1517694712202-14dd9538aa97',
        'photo-1555066931-4365d14bab8c'
      ],
      'module-database': [
        'photo-1558494949-ef010cbdcc31',
        'photo-1551288049-bebda4e38f71',
        'photo-1544383835-bda2bc66a55d',
        'photo-1563986768609-322da13575f3',
        'photo-1518770660439-4636190af475'
      ]
    };
    const list = images[modId] || images['module-database'];
    const imgId = list[index % list.length];
    return `https://images.unsplash.com/${imgId}?auto=format&fit=crop&w=400&h=300&q=80`;
  };

  const handleOptionClick = (index) => {
    if (isAnswered) return; // already answered this question
    setSelectedOption(index);
    setFetchingNotes(true);

    // Simulate fetching from GeeksforGeeks for 1.2s
    setTimeout(() => {
      setFetchingNotes(false);
      
      if (index === q.correctAnswer) {
        // Correct - fire confetti burst
        playSuccessSound();
        setScore(prev => prev + 1);
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b'],
          scalar: 0.8,
        });
      } else {
        // Wrong - shake animation
        playFailSound();
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 1200);
  };

  const handleNext = () => {
    if (isLast) {
      navigate('/results', { 
        state: { 
          score: score, 
          total: quiz.questions.length, 
          quizId, 
          quizTitle: quiz.title 
        } 
      });
    } else {
      setCurrentIndex(prev => {
        const nextIdx = prev + 1;
        if (nextIdx < quiz.questions.length) {
          return nextIdx;
        }
        return prev;
      });
      setSelectedOption(null);
    }
  };

  const getOptionClass = (index) => {
    if (!isAnswered) return 'option-btn';
    if (index === q.correctAnswer) return 'option-btn correct';
    if (index === selectedOption) return 'option-btn incorrect';
    return 'option-btn dimmed';
  };

  return (
    <div className="quiz-page animate-fade-in">
      {/* Nav */}
      <div className="quiz-topbar">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Exit
        </button>
        <div className="quiz-meta">
          <span className="quiz-qcount">Q {currentIndex + 1} / {quiz.questions.length}</span>
          <div className={`quiz-score-badge ${pulse ? 'pulse' : ''}`}>
            ⭐ {score}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar-container" style={{ borderRadius: 0, height: '6px', marginBottom: 0 }}>
        <div className="progress-bar" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
      </div>

      <div className="quiz-body container" style={{ maxWidth: '780px' }}>
        {/* Question */}
        <div className={`card quiz-card ${shake ? 'shake' : ''}`}>
          <p className="quiz-module-label">{quiz.title}</p>
          <h3 className="quiz-question-text">{q.text}</h3>

          {q.imageUrl && (
            <div className="quiz-img-wrap">
              <img src={q.imageUrl} alt="Diagram" className="quiz-image" />
            </div>
          )}

          <div className="options-list">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={getOptionClass(i)}
                onClick={() => handleOptionClick(i)}
                disabled={isAnswered}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
                {isAnswered && i === q.correctAnswer && (
                  <CheckCircle size={20} className="option-icon correct-icon" />
                )}
                {isAnswered && i === selectedOption && i !== q.correctAnswer && (
                  <XCircle size={20} className="option-icon wrong-icon" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fetching Skeleton */}
        {fetchingNotes && (
          <div className="explanation-card animate-slide-up fetching-skeleton">
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Fetching relevant notes & images from GeeksforGeeks...
            </p>
          </div>
        )}

        {/* Auto explanation - shows after fetching */}
        {isAnswered && !fetchingNotes && (
          <div className={`explanation-card animate-slide-up ${isCorrect ? 'explanation-correct' : 'explanation-wrong'}`}>
            <div className="explanation-header">
              {isCorrect
                ? <><CheckCircle size={20} /> <strong>Correct!</strong></>
                : <><XCircle size={20} /> <strong>Incorrect</strong> — The correct answer is: <em>{q.options[q.correctAnswer]}</em></>
              }
            </div>
            
            <div className="gfg-notes-box animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="gfg-notes-header">
                <BookOpen size={18} /> GeeksforGeeks Reference
              </div>
              <div className="gfg-content-split">
                <div className="gfg-text">
                  <div className="doc-section">
                    <h4 className="doc-subtitle">Key Concept</h4>
                    <p className="doc-text">{q.explanation.split('.')[0] + '.'}</p>
                  </div>
                  {q.explanation.split('.').length > 2 && (
                    <div className="doc-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      <h4 className="doc-subtitle">Deep Dive</h4>
                      <p className="doc-text">
                        {q.explanation.substring(q.explanation.indexOf('.') + 1).trim()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="gfg-image-wrap">
                  <img src={getModuleImage(moduleId, currentIndex)} alt="Concept Diagram" />
                </div>
              </div>
              <a 
                href={`https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(q.text)}`}
                target="_blank" 
                rel="noreferrer" 
                className="gfg-link-btn"
              >
                Read full documentation <ExternalLink size={18} />
              </a>
            </div>

            <button className="btn btn-primary next-btn" onClick={handleNext}>
              {isLast ? 'See Results' : 'Next Question'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
