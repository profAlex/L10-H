import {usersCollection} from "../../db/mongo.db";


export async function isUniqueLogin(sentLogin: string): Promise<boolean> {

    if (!sentLogin.trim()) {
        console.error('Irregular error: login appear to be empty inside isUniqueLogin function, but passed middleware checks')
        throw new Error('Irregular error: login appear to be empty inside isUniqueLogin function, but passed middleware checks');
    }

    const filter = {
        $or: [
            { login: sentLogin },
        ]
    };

    return !(await usersCollection.countDocuments(filter));
}

export async function isUniqueEmail(sentEmail: string): Promise<boolean> {

    if (!sentEmail.trim()) {
        console.error('Irregular error: email appear to be empty inside isUniqueEmail function, but passed middleware checks')
        throw new Error('Irregular error: email appear to be empty inside isUniqueEmail function, but passed middleware checks');
    }

    const filter = {
        $or: [
            { email: sentEmail },
        ]
    };

    return !(await usersCollection.countDocuments(filter));
}