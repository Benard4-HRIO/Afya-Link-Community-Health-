// src/pages/QuizPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const QuizPage = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/education/content/${id}`)
      .then((res) => {
        const parsedQuiz = JSON.parse(res.data.content);
        setQuiz({ ...parsedQuiz, title: res.data.title, language: res.data.language });
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!quiz) return <p>Loading quiz...</p>;

  const handleChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    const payload = {
      answers: Object.keys(answers).map((qid) => ({
        questionId: parseInt(qid),
        answer: answers[qid],
      })),
    };

    axios
      .post(`http://localhost:5000/api/education/quizzes/${id}/submit`, payload)
      .then((res) => {
        setResult(res.data);
        setSubmitted(true);
      })
      .catch((err) => console.error(err));
  };

  if (submitted)
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {quiz.language === 'sw' ? 'Matokeo ya Jaribio' : 'Quiz Result'}
        </h2>
        <p>
          {quiz.language === 'sw' ? 'Alama' : 'Score'}: {result.score} / {result.totalQuestions}
        </p>
        <p>
          {quiz.language === 'sw' ? 'Asilimia' : 'Percentage'}: {result.percentage}%
        </p>
        <p>{result.passed ? (quiz.language === 'sw' ? 'Umeshinda!' : 'You passed!') : (quiz.language === 'sw' ? 'Jaribu tena.' : 'Try again.')}</p>
        <div className="mt-4">
          {result.feedback.map((msg, idx) => (
            <p key={idx} className="text-gray-700">{msg}</p>
          ))}
        </div>
        <Link to="/education" className="mt-6 inline-block text-blue-500">
          ← {quiz.language === 'sw' ? 'Rudi kwa Elimu' : 'Back to Education'}
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>

      {quiz.questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="font-semibold mb-2">{q.question}</p>
          {q.options.map((opt) => (
            <div key={opt} className="flex items-center gap-2 mb-1">
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt}
                onChange={() => handleChange(q.id, opt)}
                id={`q${q.id}-${opt}`}
              />
              <label htmlFor={`q${q.id}-${opt}`}>{opt}</label>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        {quiz.language === 'sw' ? 'Tuma Majibu' : 'Submit Answers'}
      </button>

      <Link to="/education" className="mt-4 inline-block text-blue-500">
        ← {quiz.language === 'sw' ? 'Rudi kwa Elimu' : 'Back to Education'}
      </Link>
    </div>
  );
};

export default QuizPage;
