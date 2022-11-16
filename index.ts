import express from 'express'
import { register, login, isEmailExist, createQuiz, getUserQuizzes, getQuizById, createQuizAttempt, getQuizAttempted} from './src/mainController'
const app = express()
app.use(express.json())


app.post('/register', register);
app.post('/login', login);
app.get('/email/check', isEmailExist);
app.post('/quiz/create', createQuiz);
app.get('/user/quizzes', getUserQuizzes);
app.get('/quiz/:id', getQuizById);
app.get('/quiz/attempts/:userId', getQuizAttempted);
app.post('/quiz/attempt', createQuizAttempt);




app.listen(3000, () =>
  console.log('REST API server ready at: http://localhost:3000'),
)