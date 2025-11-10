export interface UserModel {
    user_id?: number;
    cognito_user_id: string;
    email: string;
    phone: string;
    userType: "BUYER" | "SELLER";
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
    verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
}
