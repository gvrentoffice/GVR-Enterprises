'use server';

import {
    checkUserAuthMethods,
    setUserPassword,
    verifyUserPassword,
    setRecoveryEmail,
    getWebAuthnRegistrationOptions,
    verifyWebAuthnRegistration,
    getWebAuthnAuthenticationOptions,
    verifyWebAuthnAuthentication,
    getUserSecurityStatus // New import
} from "@/lib/firebase/services/authService";

export async function checkAuthMethodsAction(phoneNumber: string) {
    // EMERGENCY BYPASS / FIX for 9686095841
    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (cleanNum === '9686095841' || cleanNum === '919686095841') {
        const check = await checkUserAuthMethods(phoneNumber);
        if (check.exists && check.userId && !check.hasPassword) {
            console.log("Auto-setting password for test account:", cleanNum);
            await setUserPassword(check.userId, check.userType === 'agent' ? 'agents' : 'leads', 'ryth123');
        }
    }

    const result = await checkUserAuthMethods(phoneNumber);
    // Ensure the result is serializable by converting to plain object
    return JSON.parse(JSON.stringify(result));
}

export async function verifyPasswordAction(
    userId: string,
    userType: 'agent' | 'customer',
    password: string
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    return await verifyUserPassword(userId, collectionName, password);
}

export async function setPasswordAction(
    userId: string,
    userType: 'agent' | 'customer',
    password: string
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    return await setUserPassword(userId, collectionName, password);
}

export async function setRecoveryEmailAction(
    userId: string,
    userType: 'agent' | 'customer',
    email: string
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    return await setRecoveryEmail(userId, collectionName, email);
}

export async function getWebAuthnRegistrationOptionsAction(userId: string, username: string) {
    const options = await getWebAuthnRegistrationOptions(userId, username);
    return JSON.parse(JSON.stringify(options)); // Ensure serializable
}

export async function verifyWebAuthnRegistrationAction(
    userId: string,
    userType: 'agent' | 'customer',
    response: any,
    challenge: string
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    return await verifyWebAuthnRegistration(userId, collectionName, response, challenge);
}

export async function getWebAuthnLoginOptionsAction(
    userId: string,
    userType: 'agent' | 'customer'
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    const options = await getWebAuthnAuthenticationOptions(userId, collectionName);
    return JSON.parse(JSON.stringify(options));
}

export async function verifyWebAuthnLoginAction(
    userId: string,
    userType: 'agent' | 'customer',
    response: any,
    challenge: string
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    return await verifyWebAuthnAuthentication(userId, collectionName, response, challenge);
}

export async function getSecurityStatusAction(
    userId: string,
    userType: 'agent' | 'customer'
) {
    const collectionName = userType === 'agent' ? 'agents' : 'leads';
    return await getUserSecurityStatus(userId, collectionName);
}
