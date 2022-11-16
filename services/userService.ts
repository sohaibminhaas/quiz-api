import { prisma, Users } from '@prisma/client';
import prismaClient from '../src/prisma';
import { passwordToHash } from '../helpers/helper';
import { sendEmail } from '../helpers/send-email';


export async function createUser({
    firstName,
    lastName,
    password,
    email
}: {
    firstName: string;
    lastName: string;
    password: string;
    email: string
}) {
    try {
        const newUser = prismaClient.users.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                password: passwordToHash(password),
                email: email
            }
        });
        return newUser;
    } catch (error) {
        return undefined;
    }
}

export async function create({
    quizTitle,
    userId,
    questions
}: {
    quizTitle: string;
    userId: number;
    questions: Array<{
        title: string;
        options: Array<{
            isAnswer: string;
            title: string;
            score: string;
        }>
    }>;
}) {
    try {
        const newQuizResponse = await prismaClient.$transaction(
            async (prisma) => {
                const newQuiz = await prisma.quizzes.create({
                    data: {
                        title: quizTitle,
                        createdById: Number(userId),
                    }
                });
                if (!newQuiz) {
                    return {
                        status: false,
                        data: undefined
                    }
                }
                for (let i = 0; i < questions.length; i++) {
                    const newQuestion = await prisma.questions.create({
                        data: {
                            title: questions[i].title,
                            quizId: newQuiz.id
                        }
                    });
                    const options = questions[i].options.map((option) => {
                        return {
                            title: option.title,
                            isCorrect: option.isAnswer == 'true',
                            score: option.score == "" ? 0 : option.score,
                            questionId: newQuestion.id,
                        };
                    });
                    await prisma.answers.createMany({
                        data: options
                    })
                }
                return {
                    status: true,
                    data: newQuiz
                }
            });

        console.log("newQuizResponse===============", newQuizResponse)
        if (newQuizResponse.status) {
            console.log("here=============")
            sendEmail(newQuizResponse.data?.id);
        }
        return {
            status: true,
            data: newQuizResponse
        }
    } catch (error) {
        console.log("error in creating quiz", error);
        return undefined;
    }
}

export async function createAttempt({
    quizId,
    userId,
    answers
}: {
    quizId: number;
    userId: number;
    answers: Array<{
        questionId: number;
        answerId: number;
    }>;
}) {
    try {
        const newQuizAttemptResponse = await prismaClient.$transaction(
            async (prisma) => {
                const quizAttempt = await prisma.quizAttempts.create({
                    data: {
                        quizId: Number(quizId),
                        userId: userId,
                    }
                });
                if (!quizAttempt) {
                    return {
                        status: false,
                        data: undefined
                    }
                }
                const options = answers.map((option) => {
                    return {
                        quizAttemptsId: quizAttempt.id,
                        questionId: Number(option.questionId),
                        answerId: Number(option.answerId)
                    };
                });
                await prisma.quizAttemptAnswers.createMany({
                    data: options
                })
                return quizAttempt;
            });
        return {
            status: true,
            data: newQuizAttemptResponse
        }
    } catch (error) {
        console.log("error in creating quiz", error);
        return undefined;
    }
}

export async function getQuizzesByUserId(userId: number) {
    try {
        const user = prismaClient.quizzes.findMany({
            where: {
                createdById: userId
            },
            select: {
                title: true,
                id: true,
                questions: {
                    select: {
                        title: true,
                        answers: {
                            select: {
                                title: true,
                                isCorrect: true,
                                score: true
                            }
                        }
                    }
                }
            }
        });
        return user;
    } catch (error) {
        return undefined;
    }
}

export async function getQuizAttempts(userId: number) {
    try {
        const quizAttempts = prismaClient.quizAttempts.findMany({
            where: {
                userId: userId
            },
            select: {
                quizId: true,
                id: true,
                quiz: {
                    select: {
                        title: true
                    }
                },
                quizAttemptAnswers: {
                    select: {
                        id: true,
                        questionId: true,
                        answerId: true,
                        question: {
                            select: {
                                title: true,
                                answers: {
                                    select: {
                                        id: true,
                                        title: true,
                                        isCorrect: true,
                                        score: true,
                                        questionId: true
                                    }
                                }
                            }
                        },
                    }
                }
            }
        });
        return quizAttempts;
    } catch (error) {
        return undefined;
    }
}

export async function getQuiz(quizId: number) {
    try {
        const user = prismaClient.quizzes.findFirst({
            where: {
                id: quizId
            },
            select: {
                title: true,
                id: true,
                questions: {
                    select: {
                        title: true,
                        answers: {
                            select: {
                                id: true,
                                title: true,
                                isCorrect: true,
                                score: true,
                                questionId: true
                            }
                        }
                    }
                }
            }
        });
        return user;
    } catch (error) {
        return undefined;
    }
}

export async function getTotalQuizScore(quizId: number) {
    try {
        const totalScore = await prismaClient.answers.aggregate({
            where: {
                question: {
                    quizId: quizId
                }
            },
            _sum: {
                score: true
            }
        });

        const totalQuestions = await prismaClient.questions.aggregate({
            where: {
                quizId: quizId
            },
            _count: {
                id: true
            }
        });
        return {
            totalScore: totalScore._sum.score,
            totalQuestions: totalQuestions._count.id
        };
    } catch (error) {
        return undefined;
    }
}

export async function getUser({
    email,
}: {
    email: string
}) {
    try {
        const user = prismaClient.users.findFirst({
            where: {
                email: email
            }
        });
        return user;
    } catch (error) {
        return undefined;
    }
}