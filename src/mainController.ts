
import { Decimal } from '@prisma/client/runtime';
import { Request, Response } from 'express';
import { passwordToHash } from '../helpers/helper';
import { 
    createUser, 
    getUser, 
    create , 
    getQuizzesByUserId, 
    getQuiz, 
    createAttempt, 
    getQuizAttempts,
    getTotalQuizScore} from '../services/userService';


export async function register(req: Request, res: Response) {
    try {
        const data = Object.assign(req.body);
        if(data){
            const newUser = await createUser(data);
            return res.send({
                status: true,
                data: newUser
            });
        }
        res.send({
            status: false,
            data: undefined
        });
        
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const data = Object.assign(req.body);
        if(data){
            const user = await getUser({email: data.email });
            if(user && user.password === passwordToHash(data.password)){
                return res.send({
                    status: true,
                    data: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                    }
                });
            }
        }
        res.send({
            status: false,
            data: undefined
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function createQuiz(req: Request, res: Response) {
    try {
        const data = Object.assign(req.body);
        if(data){
            const newQuiz = await create(data);
            console.log("newQuiz==========", newQuiz);
            return res.send({
                status: true,
                data: newQuiz
            });
        }
        res.send({
            status: false,
            data: undefined
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function getUserQuizzes(req: Request, res: Response) {
    try {
        const data = Object.assign(req.query);
        if(data){
            const quizzesList = await getQuizzesByUserId(parseInt(data.userId));
            if(!quizzesList){
                return res.send({
                    status: false,
                    data: quizzesList
                });
            }
            return res.send({
                status: true,
                data: quizzesList
            });
        }
        res.send({
            status: false,
            data: undefined
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function getQuizById(req: Request, res: Response) {
    try {
        const quizId = req.params.id;
        if(quizId){
            const quiz = await getQuiz(parseInt(quizId));
            if(!quiz){
                return res.send({
                    status: false,
                    data: quiz
                });
            }
            return res.send({
                status: true,
                data: quiz
            });
        }
        res.send({
            status: false,
            data: undefined
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function createQuizAttempt(req: Request, res: Response) {
    try {
        const data = Object.assign(req.body);
        if(data){
            const quizAttempt = await createAttempt(data);
            if(!quizAttempt){
                return res.send({
                    status: false,
                    data: quizAttempt
                });
            }
            return res.send({
                status: true,
                data: quizAttempt
            });
        }
        res.send({
            status: false,
            data: undefined
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function getQuizAttempted(req: Request, res: Response) {
    try {
        const userId = req.params.userId;
        if(userId){
            const quizAttempts: any = await getQuizAttempts(Number(userId));
            if(!quizAttempts){
                return res.send({
                    status: false,
                    data: quizAttempts
                });
            }
            var data: Array<{
                quizId: Number,
                title: string,
                score: Number,
                totalScore: Decimal | null | undefined,
                totalQuestions: number | null | undefined,
            }> = [];

            for(var i=0; i< quizAttempts.length; i++) {
                let totalScoreAfterAttempt: number = 0;
                const totalQuizScore = await getTotalQuizScore(quizAttempts[i].quizId);
                quizAttempts[i].quizAttemptAnswers.forEach((element: any) => {
                    let correctedOption = element.question.answers.filter((option: any) => { return option.isCorrect});
                    correctedOption = correctedOption[0];
                    if(correctedOption.questionId == element.questionId && correctedOption.id == element.answerId){
                        totalScoreAfterAttempt =  totalScoreAfterAttempt + Number(correctedOption.score);
                    }
                });
                data.push({
                    quizId: quizAttempts[i].quizId,
                    title: quizAttempts[i].quiz.title,
                    score: totalScoreAfterAttempt,
                    totalScore: totalQuizScore?.totalScore,
                    totalQuestions: totalQuizScore?.totalQuestions,
                });
            };

            return res.send({
                status: true,
                data: data
            });
        }
        res.send({
            status: false,
            data: undefined
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
            data: undefined
        });
    }
}

export async function isEmailExist(req: Request, res: Response) {
    try {
        const data = Object.assign(req.query);
        if(data){
            const user = await getUser({email: data.email });
            if(user && user.email === data.email){
                return res.send({
                    status: true
                });
            }
        }
        res.send({
            status: false,
        });
    } catch (error) {
        console.log("error in creating user", error);
        res.send({
            status: false,
        });
    }
}