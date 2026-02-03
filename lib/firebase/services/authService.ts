import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Agent, Lead } from '../schema';
import { TENANT_ID } from '../../constants';
// @ts-ignore
import bcrypt from 'bcryptjs';

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';

// CONSTANTS for WebAuthn
const RP_NAME = 'Ryth Bazar';
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Check if a user exists and what auth methods they have enabled
 */
export async function checkUserAuthMethods(phoneNumber: string): Promise<{
    exists: boolean;
    userId?: string;
    userType?: 'agent' | 'customer';
    hasPassword?: boolean;
    hasBiometrics?: boolean;
    authPreferences?: Lead['authPreferences'];
    recoveryEmail?: string;
}> {
    try {
        // Prepare phone formats
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        // Assuming strictly Indian numbers for now based on +91 context, can be generalized later
        const formats = [
            `+${cleanNumber}`,              // existing input
            cleanNumber,                    // existing input
        ];

        // Specific logic for Indian numbers (10 digits)
        if (cleanNumber.length === 10) {
            formats.push(`+91${cleanNumber}`);
            formats.push(`91${cleanNumber}`);
        } else if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
            formats.push(`+${cleanNumber}`);     // +91...
            formats.push(cleanNumber.slice(2));  // 98...
        }
        // Remove duplicates and invalid lengths
        const searchNumbers = [...new Set(formats)].filter(n => n.length >= 10);

        // 1. Check Agent
        const agentQuery = query(
            collection(db, 'agents'),
            where('tenantId', '==', TENANT_ID),
            where('whatsappNumber', 'in', searchNumbers)
        );
        const agentSnap = await getDocs(agentQuery);

        if (!agentSnap.empty) {
            const agent = agentSnap.docs[0].data() as Agent;
            return {
                exists: true,
                userId: agent.id,
                userType: 'agent',
                hasPassword: !!agent.passwordHash,
                hasBiometrics: !!agent.webAuthnCredentials && agent.webAuthnCredentials.length > 0,
                authPreferences: agent.authPreferences,
                recoveryEmail: agent.recoveryEmail
            };
        }

        // 2. Check Customer (Lead)
        const leadQuery = query(
            collection(db, 'leads'),
            where('tenantId', '==', TENANT_ID),
            where('whatsappNumber', 'in', searchNumbers)
        );
        const leadSnap = await getDocs(leadQuery);

        if (!leadSnap.empty) {
            const lead = leadSnap.docs[0].data() as Lead;
            return {
                exists: true,
                userId: lead.id,
                userType: 'customer',
                hasPassword: !!lead.passwordHash,
                hasBiometrics: !!lead.webAuthnCredentials && lead.webAuthnCredentials.length > 0,
                authPreferences: lead.authPreferences,
                recoveryEmail: lead.recoveryEmail
            };
        }

        return { exists: false };
    } catch (error) {
        console.error('Error checking user auth methods:', error);
        return { exists: false };
    }
}

/**
 * Set User Password
 */
export async function setUserPassword(
    userId: string,
    collectionName: 'agents' | 'leads',
    plainTextPassword: string
): Promise<boolean> {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainTextPassword, salt);

        await updateDoc(doc(db, collectionName, userId), {
            passwordHash: hash,
            updatedAt: Timestamp.now(),
            authPreferences: {
                enablePasswordLogin: true,
                enableBiometricLogin: true // Default true if they set it up
            }
        });
        return true;
    } catch (error) {
        console.error('Error setting password:', error);
        return false;
    }
}

/**
 * Verify User Password
 */
export async function verifyUserPassword(
    userId: string,
    collectionName: 'agents' | 'leads',
    plainTextPassword: string
): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, collectionName, userId));
        if (!userDoc.exists()) return false;

        const userData = userDoc.data() as Agent | Lead;
        if (!userData.passwordHash) return false;

        return await bcrypt.compare(plainTextPassword, userData.passwordHash);
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}

/**
 * Set Recovery Email
 */
export async function setRecoveryEmail(
    userId: string,
    collectionName: 'agents' | 'leads',
    email: string
): Promise<boolean> {
    try {
        await updateDoc(doc(db, collectionName, userId), {
            recoveryEmail: email,
            isEmailVerified: true, // Assuming this is called after OTP verification
            updatedAt: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error('Error setting recovery email:', error);
        return false;
    }
}

/**
 * Update Auth Preferences
 */
export async function updateAuthPreferences(
    userId: string,
    collectionName: 'agents' | 'leads',
    preferences: Partial<Lead['authPreferences']>
): Promise<boolean> {
    try {
        await updateDoc(doc(db, collectionName, userId), {
            authPreferences: preferences,
            updatedAt: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error('Error updating auth preferences:', error);
        return false;
    }
}

// ------------------------------------------------------------------
// WebAuthn (Biometrics) Helpers
// ------------------------------------------------------------------

/**
 * Generate Registration Options
 */
export async function getWebAuthnRegistrationOptions(userId: string, username: string) {
    // In a real app, retrieve existing authenticators to prevent re-registration
    // const userAuthenticators = ...

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: new TextEncoder().encode(userId),
        userName: username,
        // Don't exclude credentials for now, allow multiple devices
        // excludeCredentials: ...
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'cross-platform', // Allow both platform (FaceID) and roaming (YubiKey)
        },
    });

    // Save challenge to DB (temporarily) - In a stateless setup, maybe store in signed cookie/session
    // For simplicity, we assume the client sends it back or we verify statelessly if using JWT
    return options;
}

/**
 * Verify Registration Response
 */
// @ts-ignore
export async function verifyWebAuthnRegistration(
    userId: string,
    collectionName: 'agents' | 'leads',
    response: any,
    expectedChallenge: string // Passed from client/session
) {
    try {
        // @ts-ignore
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            // @ts-ignore
            const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

            // Save credential to DB
            const newCredential = {
                id: Buffer.from(credentialID).toString('base64'),
                publicKey: Buffer.from(credentialPublicKey).toString('base64'),
                counter,
                transports: response.response.transports,
            };

            // This requires arrayUnion but let's just read and update for safety with our interface
            const userRef = doc(db, collectionName, userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() as Lead; // Works for Agent too for this field
            const currentCreds = userData.webAuthnCredentials || [];

            await updateDoc(userRef, {
                webAuthnCredentials: [...currentCreds, newCredential],
                authPreferences: {
                    ...userData.authPreferences,
                    enableBiometricLogin: true
                },
                updatedAt: Timestamp.now()
            });

            return true;
        }
    } catch (error) {
        console.error('WebAuthn verification failed:', error);
    }
    return false;
}

/**
 * Generate Authentication Options
 */
export async function getWebAuthnAuthenticationOptions(
    userId: string,
    collectionName: 'agents' | 'leads',
) {
    const userRef = doc(db, collectionName, userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;

    const userData = userSnap.data() as Lead;
    const existingCreds = userData.webAuthnCredentials || [];

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: existingCreds.map(cred => ({
            id: cred.id, // Using the string ID we stored
            transports: cred.transports as any, // Cast to fix type mismatch
        })),
        userVerification: 'preferred',
    });

    return options;
}

/**
 * Verify Authentication Response
 */
// @ts-ignore
export async function verifyWebAuthnAuthentication(
    userId: string,
    collectionName: 'agents' | 'leads',
    response: any,
    expectedChallenge: string
) {
    try {
        const userRef = doc(db, collectionName, userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;

        const userData = userSnap.data() as Lead; // Works for Agent too
        const existingCreds = userData.webAuthnCredentials || [];

        const dbCredential = existingCreds.find(cred => cred.id === response.id);
        if (!dbCredential) return false;

        // @ts-ignore
        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialID: dbCredential.id,
                credentialPublicKey: Buffer.from(dbCredential.publicKey, 'base64'),
                counter: dbCredential.counter,
                transports: dbCredential.transports as any,
            },
        } as any);

        const { verified, authenticationInfo } = verification;

        if (verified && authenticationInfo) {
            // Update the counter
            const updatedCreds = existingCreds.map(cred => {
                if (cred.id === response.id) {
                    return { ...cred, counter: authenticationInfo.newCounter };
                }
                return cred;
            });

            await updateDoc(userRef, {
                webAuthnCredentials: updatedCreds,
                updatedAt: Timestamp.now(),
            });

            return true;
        }
    } catch (error) {
        console.error('WebAuthn authentication failed:', error);
    }
    return false;
}

export async function getUserSecurityStatus(
    userId: string,
    collectionName: 'agents' | 'leads'
): Promise<{
    hasPassword: boolean;
    hasBiometrics: boolean;
    authPreferences: Lead['authPreferences'];
    recoveryEmail: string;
    isEmailVerified: boolean;
}> {
    try {
        const userRef = doc(db, collectionName, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        const data = userSnap.data() as Lead;
        return {
            hasPassword: !!data.passwordHash,
            hasBiometrics: !!(data.webAuthnCredentials && data.webAuthnCredentials.length > 0),
            authPreferences: data.authPreferences || { enablePasswordLogin: false, enableBiometricLogin: false },
            recoveryEmail: data.recoveryEmail || '',
            isEmailVerified: !!data.isEmailVerified
        };
    } catch (error) {
        console.error("Error fetching security status:", error);
        throw error;
    }
}
